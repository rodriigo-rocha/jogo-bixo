import { fakerPT_BR as faker } from "@faker-js/faker";
import chalk from "chalk";
import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { CreateBetSchema } from "../../../../schema/src/game";
import { intToDecimal } from "../../helpers/formatters";
import type { DbInstance } from "../../plugins/db";
import { logger } from "../../plugins/logger";
import { users, draws } from "../../schema";
import { GameService } from "../game/game.service";
import { UserService } from "../users/users.service";

// Serviço para simulação de bots
export class SimulationService {
  private gameService: GameService;
  private userService: UserService;

  constructor(private db: DbInstance) {
    this.gameService = new GameService(db);
    this.userService = new UserService(db);
  }

  // Gera dados aleatórios para um bot
  private generateBotData() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const username = `${firstName} ${lastName}`;

    return {
      username,
      email: `bot.${uuidv7().slice(-8)}@simulacao.com`,
      password: "botpassword123", // Hash não importa muito pois eles não logam
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      role: "player" as const,
      balance: 10000,
    };
  }

  // Garante que existam bots suficientes no sistema
  async ensureBots(count = 10) {
    const bots = await this.db.query.users.findMany({
      where: (u, { like }) => like(u.email, "%@simulacao.com"),
      limit: count,
    });

    if (bots.length < count) {
      const missing = count - bots.length;
      console.log(`🤖 Criando ${missing} novos bots...`);

      for (let i = 0; i < missing; i++) {
        const botData = this.generateBotData();
        await this.userService.create(botData);
      }
    }
  }

  // Simula uma aposta aleatória de um bot
  async simulateRandomBet() {
    const bots = await this.db.query.users.findMany({
      where: (u, { like }) => like(u.email, "%@simulacao.com"),
    });

    if (bots.length === 0) return;

    const randomBot = bots[Math.floor(Math.random() * bots.length)];

    if (randomBot.balance < 500) {
      // Menos de R$ 5,00
      // Recarrega o bot
      await this.db
        .update(users)
        .set({ balance: 5000 }) // R$ 50,00
        .where(eq(users.id, randomBot.id));

      await this.gameService.logTransaction(
        randomBot.id,
        "DEPOSIT",
        5000,
        "Recarga automática de Simulação",
      );
      return;
    }

    // Buscar um sorteio aberto
    const openDraws = await this.db.query.draws.findMany({
      where: eq(draws.status, "OPEN"),
      limit: 1,
    });

    if (openDraws.length === 0) {
      logger.debug("Nenhum sorteio aberto para simulação");
      return;
    }

    // Escolher o primeiro sorteio aberto (poderia ser aleatório também)
    const drawId = openDraws[0].id;

    const types = ["GRUPO", "DEZENA", "MILHAR"] as const;
    const selectedType = types[Math.floor(Math.random() * types.length)];

    let selection = 0;
    let amount = 0;

    // Definir seleção e valor baseado no tipo
    if (selectedType === "GRUPO") {
      selection = Math.floor(Math.random() * 25) + 1; // 1 a 25
      amount = [2, 3, 5, 10][Math.floor(Math.random() * 4)]; // R$ 2, 3, 5 ou 10
    } else if (selectedType === "DEZENA") {
      selection = Math.floor(Math.random() * 100); // 0 a 99
      amount = [1, 2, 3][Math.floor(Math.random() * 3)]; // R$ 1, 2, 3
    } else {
      selection = Math.floor(Math.random() * 10000); // 0 a 9999
      amount = 1; // R$ 1,00
    }

    try { // Tenta fazer a aposta
      const betData = CreateBetSchema.parse({
        drawId,
        betor: randomBot.username,
        amount,
        type: selectedType,
        selection,
      });

      await this.gameService.placeBet(randomBot.id, betData);
      logger.debug(
        `🎲 ${chalk.blue(randomBot.username)} apostou ${chalk.green(`R$${intToDecimal(amount * 100)}`)} no ${chalk.yellow(`${selectedType} ${selection}`)}`,
      );
    } catch (error) {
      logger.error(`Erro na simulação do bot ${randomBot.username}: ${error}`);
    }
  }
}
