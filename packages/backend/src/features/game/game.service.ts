import { and, eq, gte, lte, type SQL, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { type CreateBet, GAME_ODDS } from "../../../../schema/src/game";
import { BadRequestError, NotFoundError } from "../../error";
import {
  checkVictory,
  getAnimalGroup,
  getAnimalName,
} from "../../helpers/game-rules";
import { getRandomWeather } from "../../helpers/weather";
import type { DbInstance } from "../../plugins/db";
import {
  type BetsStatus,
  bets,
  draws,
  type TransactionType,
  transactions,
  users,
} from "../../schema";

export class GameService {
  constructor(private db: DbInstance) {}

  async logTransaction(
    userId: string,
    type: "BET" | "WIN" | "DEPOSIT" | "WITHDRAW",
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

  async placeBet(userId: string, data: CreateBet) {
    if (data.type === "GRUPO" && (data.selection < 1 || data.selection > 25)) {
      throw new BadRequestError(
        "Para apostas em GRUPO, o número deve ser entre 1 e 25 (Bichos).",
      );
    }
    if (data.type === "DEZENA" && (data.selection < 0 || data.selection > 99)) {
      throw new BadRequestError(
        "Para apostas em DEZENA, o número deve ser entre 00 e 99.",
      );
    }
    if (
      data.type === "MILHAR" &&
      (data.selection < 0 || data.selection > 9999)
    ) {
      throw new BadRequestError(
        "Para apostas em MILHAR, o número deve ser entre 0000 e 9999.",
      );
    }

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) throw new NotFoundError("User not found");
    if (user.balance < data.amount)
      throw new BadRequestError("Saldo insuficiente");

    // Desconta Saldo
    const newBalance = user.balance - data.amount;
    await this.db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId));

    // Cria Aposta
    const potentialWin = data.amount * GAME_ODDS[data.type];
    const betData = {
      id: uuidv7(),
      userId,
      amount: data.amount,
      type: data.type,
      selection: data.selection,
      potentialWin,
      status: "PENDING" as BetsStatus,
      createdAt: new Date(),
    };
    await this.db.insert(bets).values(betData).returning();

    let desc = `${data.type} ${data.selection}`;
    if (data.type === "GRUPO") desc += ` (${getAnimalName(data.selection)})`;
    else if (data.type === "DEZENA")
      desc += ` (Grupo ${getAnimalName(getAnimalGroup(data.selection))})`;

    await this.logTransaction(
      userId,
      "BET",
      data.amount,
      `Aposta: ${desc}`,
      betData.id,
    );

    return betData;
  }

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

  async getLatestDraws() {
    return await this.db.query.draws.findMany({
      orderBy: (draws, { desc }) => [desc(draws.createdAt)],
      limit: 10,
    });
  }

  async getUserBets(userId: string, page = 0) {
    return await this.db.query.bets.findMany({
      where: eq(bets.userId, userId),
      orderBy: (bets, { desc }) => [desc(bets.createdAt)],
      limit: 50,
      offset: 50 * page,
      with: { draw: true }, // Inclui o resultado do sorteio se houver
    });
  }

  async getUserTransactions(userId: string, page = 0) {
    return await this.db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 50,
      offset: 50 * page,
    });
  }

  async getAdminBets(filters: {
    status?: BetsStatus;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    drawId?: string;
    page: number;
  }) {
    const conditions: SQL<unknown>[] = [];

    if (filters.status) conditions.push(eq(bets.status, filters.status));
    if (filters.userId) conditions.push(eq(bets.userId, filters.userId));
    if (filters.startDate)
      conditions.push(gte(bets.createdAt, filters.startDate));
    if (filters.endDate) conditions.push(lte(bets.createdAt, filters.endDate));
    if (filters.drawId) conditions.push(eq(bets.drawId, filters.drawId));

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

  async getAdminTransactions(filters: {
    userId?: string;
    type?: TransactionType;
    page?: number;
  }) {
    const conditions: SQL<unknown>[] = [];
    if (filters.userId)
      conditions.push(eq(transactions.userId, filters.userId));
    if (filters.type) conditions.push(eq(transactions.type, filters.type));

    return await this.db.query.transactions.findMany({
      where: and(...conditions),
      orderBy: (t, { desc }) => [desc(t.createdAt)],
      limit: 100,
      offset: 100 * (filters.page ?? 0),
      with: { user: { columns: { id: true, username: true, email: true } } },
    });
  }
}
