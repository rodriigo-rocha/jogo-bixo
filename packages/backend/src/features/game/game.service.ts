import { and, desc, eq, gte, lte, type SQL, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { type CreateBet, GAME_ODDS } from "../../../../schema/src/game";
import { BadRequestError, NotFoundError } from "../../error";
import { checkVictory, getAnimalGroup, getAnimalName } from "../../helpers/game-rules";
import { getRandomWeather } from "../../helpers/weather";
import type { DbInstance } from "../../plugins/db";
import { type BetsStatus, bets, draws, type TransactionType, transactions, users } from "../../schema";

export class GameService {
  constructor(private db: DbInstance) {}

  async logTransaction(
    userId: string,
    type: "BET" | "WIN" | "DEPOSIT" | "WITHDRAW" | "REFUND",
    amount: number,
    description: string,
    referenceId?: string,
  ) {
    // Busca saldo atualizado
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { balance: true },
    });

    await this.db.insert(transactions).values({
      id: uuidv7(),
      userId,
      type,
      amount,
      balanceAfter: user!.balance, // Saldo já deve ter sido atualizado antes de chamar isso
      description,
      referenceId,
      createdAt: new Date(),
    });
  }

  // Realiza uma nova aposta para um usuário
  async placeBet(
    userId: string,
    data: CreateBet & { betor?: string; drawId?: string },
  ) {
    if (data.type === "GRUPO" && (data.selection < 1 || data.selection > 25)) {
      throw new BadRequestError("Para apostas em GRUPO, o número deve ser entre 1 e 25 (Bichos).");
    }

    // Validar seleção conforme o tipo de aposta
    // if (data.type === "DEZENA" && data.selection > 99) {
    //   throw new BadRequestError("Para apostas em DEZENA, o número deve ser entre 0 e 99.");
    // }

    // if (data.type === "CENTENA" && data.selection > 999) {
    //   throw new BadRequestError("Para apostas em CENTENA, o número deve ser entre 0 e 999.");
    // }

    // if (data.type === "MILHAR" && data.selection > 9999) {
    //   throw new BadRequestError("Para apostas em MILHAR, o número deve ser entre 0 e 9999.");
    // }

    // Verificar se o usuário existe e tem saldo suficiente
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) 
      throw new NotFoundError("Usuário não encontrado");

    if (user.balance < data.amount * 100)
      throw new BadRequestError("Saldo insuficiente");

    // Verificar se o sorteio existe e está aberto
    const draw = await this.db.query.draws.findFirst({
      where: eq(draws.id, data.drawId),
    });

    if (!draw) 
      throw new NotFoundError("Sorteio não encontrado");

    if (draw.status !== "OPEN")
      throw new BadRequestError("Sorteio não está aberto para apostas");

    // Desconta Saldo
    const newBalance = user.balance - data.amount;
    await this.db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId));

    // Cria Aposta
    const potentialWin = data.amount * GAME_ODDS[data.type] * 100;
    const betData = {
      id: uuidv7(),
      userId,
      betor: data.betor,
      drawId: data.drawId,
      amount: data.amount * 100,
      type: data.type,
      selection: data.selection,
      potentialWin,
      status: "PENDING" as BetsStatus,
      createdAt: new Date(),
    };
    await this.db.insert(bets).values(betData).returning();

    // Log Transação
    let desc = `${data.type} ${data.selection}`;
    if (data.type === "GRUPO") 
      desc += ` (${getAnimalName(data.selection)})`;
    else if (data.type === "DEZENA")
      desc += ` (Grupo ${getAnimalName(getAnimalGroup(data.selection))})`;
    else if (data.type === "CENTENA")
      desc += ` (Grupo ${getAnimalName(getAnimalGroup(data.selection % 100))})`;
    else if (data.type === "MILHAR")
      desc += ` (Grupo ${getAnimalName(getAnimalGroup(data.selection % 100))})`;

    await this.logTransaction(
      userId,
      "BET",
      data.amount,
      `Aposta: ${desc}`,
      betData.id,
    );

    return betData;
  }

  // Executa o sorteio, determina vencedores e paga prêmios
  async executeDraw() {
    const weather = await getRandomWeather();
    let drawNumber: string;

    if (weather.success) {
      // Multiplicadores arbitrários para criar entropia
      const chaosValue =
        weather.temp * 100 + weather.humidity * 13 + weather.wind * 77;

      // Pega o módulo 10000 para garantir 4 dígitos e remove sinal negativo se houver
      const calcNumber = Math.floor(Math.abs(chaosValue) % 10000);

      drawNumber = calcNumber.toString().padStart(4, "0");
    } else {
      drawNumber = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    }

    // Cria novo sorteio fechado
    const [newDraw] = await this.db
      .insert(draws)
      .values({
        id: uuidv7(),
        number: drawNumber,
        status: "CLOSED",
        createdAt: new Date(),
        city: weather.city,
        temperature: weather.success ? weather.temp : null,
        humidity: weather.success ? weather.humidity : null,
        windSpeed: weather.success ? weather.wind : null,
      })
      .returning();
    const pendingBets = await this.db.query.bets.findMany({
      where: eq(bets.status, "PENDING"),
    });

    const results = { winners: 0, totalPaid: 0, draw: drawNumber };

    for (const bet of pendingBets) {
      const isWinner = checkVictory(bet.type, bet.selection, drawNumber);

      if (isWinner) {
        // Atualiza Aposta
        await this.db
          .update(bets)
          .set({ status: "WON", drawId: newDraw.id })
          .where(eq(bets.id, bet.id));

        // Paga Usuário
        await this.db
          .update(users)
          .set({ balance: sql`${users.balance} + ${bet.potentialWin}` })
          .where(eq(users.id, bet.userId));

        // Loga Transação
        await this.logTransaction(
          bet.userId,
          "WIN",
          bet.potentialWin,
          `Prêmio: Aposta ${bet.type} (Sorteio ${drawNumber})`,
          bet.id,
        );

        results.winners++;
        results.totalPaid += bet.potentialWin;
      } else {
        await this.db
          .update(bets)
          .set({ status: "LOST", drawId: newDraw.id })
          .where(eq(bets.id, bet.id));
      }
    }

    return results;
  }

  // Obtém os últimos sorteios com total apostado
  async getLatestDraws() {
    // Priorizar sorteios abertos primeiro, depois os mais recentes
    const result = await this.db
      .select({
        id: draws.id,
        number: draws.number,
        status: draws.status,
        city: draws.city,
        temperature: draws.temperature,
        humidity: draws.humidity,
        windSpeed: draws.windSpeed,
        createdAt: draws.createdAt,
        totalValue: sql<number>`coalesce(sum(${bets.amount}), 0)`.mapWith(Number),
      })
      .from(draws)
      .leftJoin(bets, eq(draws.id, bets.drawId))
      .groupBy(draws.id)
      .orderBy(desc(draws.status), desc(draws.createdAt))
      .limit(20);

    return result;
  }

  // Obtém apostas de um usuário com paginação
  async getUserBets(userId: string, page = 0) {
    return await this.db.query.bets.findMany({
      where: eq(bets.userId, userId),
      orderBy: (bets, { desc }) => [desc(bets.createdAt)],
      limit: 50,
      offset: 50 * page,
      with: { draw: true }, // Inclui o resultado do sorteio se houver
    });
  }

  // Obtém transações de um usuário com paginação
  async getUserTransactions(userId: string, page = 0) {
    return await this.db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 50,
      offset: 50 * page,
    });
  }

  // Obtém apostas para administração com filtros e paginação
  async getAdminBets(filters: {
    status?: BetsStatus;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    drawId?: string;
    page: number;
  }) {
    const conditions: SQL<unknown>[] = [];

    // Aplicar filtros conforme fornecido
    if (filters.status) 
      conditions.push(eq(bets.status, filters.status));

    if (filters.userId) 
      conditions.push(eq(bets.userId, filters.userId));

    if (filters.startDate)
      conditions.push(gte(bets.createdAt, filters.startDate));
    
    if (filters.endDate) 
      conditions.push(lte(bets.createdAt, filters.endDate));
    
    if (filters.drawId) 
      conditions.push(eq(bets.drawId, filters.drawId));

    // Buscar apostas com condições aplicadas
    return await this.db.query.bets.findMany({
      where: and(...conditions),
      orderBy: (bets, { desc }) => [desc(bets.createdAt)],
      limit: 100,
      offset: 100 * filters.page,
      with: {
        user: { columns: { id: true, username: true, email: true } },
        draw: true,
      },
    });
  }

  // Atualiza uma aposta existente
  async updateBet(userId: string, betId: string, data: Partial<CreateBet>) {
    const bet = await this.db.query.bets.findFirst({where: and(eq(bets.id, betId), eq(bets.userId, userId))});

    if (!bet) 
      throw new NotFoundError("Aposta não encontrada");

    if (bet.status !== "PENDING")
      throw new BadRequestError("Aposta já processada, não pode ser editada");

    if (data.selection! < 0)
      throw new BadRequestError("O número tem que ser positivo");

    if (data.type === "GRUPO" && (data.selection! < 1 || data.selection! > 25))
      throw new BadRequestError("Para apostas em GRUPO, o número deve ser entre 1 e 25.");

    if (data.type === "DEZENA" && data.selection! > 99)
      throw new BadRequestError("Para apostas em DEZENA, o número deve ser entre 0 e 99.");

    if (data.type === "CENTENA" && data.selection! > 999)
      throw new BadRequestError("Para apostas em CENTENA, o número deve ser entre 0 e 999.");

    if (data.type === "MILHAR" && data.selection! > 9999)
      throw new BadRequestError("Para apostas em MILHAR, o número deve ser entre 0 e 9999.");

    // Preparar dados para atualização
    const updateData: Partial<typeof bet> = {};
    
    if (data.amount !== undefined) 
      updateData.amount = data.amount * 100;

    if (data.type !== undefined) 
      updateData.type = data.type;

    if (data.selection !== undefined) 
      updateData.selection = data.selection;

    // Recalcular potentialWin se amount ou type foram alterados
    if (updateData.amount || updateData.type) {
      const newAmount = updateData.amount ?? bet.amount;
      const newType = updateData.type ?? bet.type;
      updateData.potentialWin = newAmount * GAME_ODDS[newType];
    }

    await this.db.update(bets).set(updateData).where(eq(bets.id, betId));

    return await this.db.query.bets.findFirst({
      where: eq(bets.id, betId),
      with: { draw: true },
    });
  }

  async deleteBet(userId: string, betId: string) {
    const bet = await this.db.query.bets.findFirst({where: and(eq(bets.id, betId), eq(bets.userId, userId))});

    if (!bet) 
      throw new NotFoundError("Aposta não encontrada");
    
    if (bet.status !== "PENDING")
      throw new BadRequestError("Aposta já processada, não pode ser excluída");

    // Reembolsar saldo
    await this.db
      .update(users)
      .set({balance: sql`${users.balance} + ${bet.amount}`})
      .where(eq(users.id, userId));

    // Deletar aposta
    await this.db.delete(bets).where(eq(bets.id, betId));

    await this.logTransaction(
      userId,
      "REFUND",
      bet.amount,
      `Reembolso: Aposta ${bet.type} excluída`,
      betId,
    );

    return { success: true };
  }

  // Cria um novo sorteio aberto
  async createOpenDraw(
    data: Partial<{
      number: string;
      city: string;
      temperature: number;
      humidity: number;
      windSpeed: number;
    }>,
  ) {
    const drawData = {
      id: uuidv7(),
      number:
        data.number ||
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0"),
      status: "OPEN" as const,
      city: data.city,
      temperature: data.temperature,
      humidity: data.humidity,
      windSpeed: data.windSpeed,
      createdAt: new Date(),
    };

    const [newDraw] = await this.db.insert(draws).values(drawData).returning();

    console.log("Created draw:", newDraw);

    return newDraw;
  }

  // Atualiza um sorteio existente
  async updateDraw(
    drawId: string,
    data: Partial<{
      number: string;
      city: string;
      temperature: number;
      humidity: number;
      windSpeed: number;
    }>,
  ) {
    const draw = await this.db.query.draws.findFirst({where: eq(draws.id, drawId)});

    if (!draw) 
      throw new NotFoundError("Sorteio não encontrado");

    if (draw.status !== "OPEN")
      throw new BadRequestError("Sorteio já fechado, não pode ser editado");

    await this.db.update(draws).set(data).where(eq(draws.id, drawId));

    return await this.db.query.draws.findFirst({
      where: eq(draws.id, drawId),
    });
  }

  async deleteDraw(drawId: string) {
    const draw = await this.db.query.draws.findFirst({where: eq(draws.id, drawId)});

    if (!draw) 
      throw new NotFoundError("Sorteio não encontrado");

    if (draw.status === "OPEN") {
      const associatedBets = await this.db.query.bets.findMany({where: eq(bets.drawId, drawId)});

    if (associatedBets.length > 0)
      throw new BadRequestError("Não pode excluir sorteio aberto com apostas associadas");
    } else {
      // Para sorteios fechados, remover a referência das apostas antes de excluir
      await this.db
        .update(bets)
        .set({ drawId: null })
        .where(eq(bets.drawId, drawId));
    }

    await this.db.delete(draws).where(eq(draws.id, drawId));

    return { success: true };
  }

  // Executa um sorteio específico por ID
  async executeSpecificDraw(drawId: string) {
    const draw = await this.db.query.draws.findFirst({where: eq(draws.id, drawId)});

    if (!draw) 
      throw new NotFoundError("Sorteio não encontrado");
    
    if (draw.status !== "OPEN") 
      throw new BadRequestError("Sorteio já fechado");

    // Usar o número do sorteio existente ou gerar um novo baseado no clima
    let drawNumber = draw.number;
    if (!drawNumber) {
      const weather = await getRandomWeather();
      if (weather.success) {
        const chaosValue = weather.temp * 100 + weather.humidity * 13 + weather.wind * 77;
        const calcNumber = Math.floor(Math.abs(chaosValue) % 10000);
        drawNumber = calcNumber.toString().padStart(4, "0");
      } else {
        drawNumber = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
      }
    }

    // Atualizar o sorteio para CLOSED e definir o número
    await this.db
      .update(draws)
      .set({ status: "CLOSED", number: drawNumber })
      .where(eq(draws.id, drawId));

    // Processar apostas pendentes associadas a este sorteio
    const pendingBets = await this.db.query.bets.findMany({where: and(eq(bets.status, "PENDING"), eq(bets.drawId, drawId))});

    const results = { winners: 0, totalPaid: 0, draw: drawNumber };

    // Processar cada aposta
    for (const bet of pendingBets) {
      const isWinner = checkVictory(bet.type, bet.selection, drawNumber);

      if (isWinner) {
        // Atualiza Aposta
        await this.db
          .update(bets)
          .set({ status: "WON" })
          .where(eq(bets.id, bet.id));

        // Paga Usuário
        await this.db
          .update(users)
          .set({ balance: sql`${users.balance} + ${bet.potentialWin}` })
          .where(eq(users.id, bet.userId));

        // Loga Transação
        await this.logTransaction(
          bet.userId,
          "WIN",
          bet.potentialWin,
          `Prêmio: Aposta ${bet.type} (Sorteio ${drawNumber})`,
          bet.id,
        );

        results.winners++;
        results.totalPaid += bet.potentialWin;
      } else {
        await this.db
          .update(bets)
          .set({ status: "LOST" })
          .where(eq(bets.id, bet.id));
      }
    }

    return results;
  }

  async getAdminTransactions(query: {
    userId?: string;
    type?: TransactionType;
    page: number;
  }) {
    const conditions: SQL<unknown>[] = [];

    // Aplicar filtros conforme fornecido
    if (query.userId) 
      conditions.push(eq(transactions.userId, query.userId));
    if (query.type) 
      conditions.push(eq(transactions.type, query.type));

    // Buscar transações com condições aplicadas
    return await this.db.query.transactions.findMany({
      where: and(...conditions),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 100,
      offset: 100 * query.page,
      with: {
        user: { columns: { id: true, username: true, email: true } },
      },
    });
  }
}
