import { cron, Patterns } from "@elysiajs/cron";
import { Elysia } from "elysia";
import { db } from "../../plugins/db";
import { SimulationService } from "./simulation.service";

const simulationService = new SimulationService(db);

(async () => {
  await simulationService.ensureBots(20);
})();

// Cron job para simular apostas de bots periodicamente
export const simulationCron = new Elysia()
  .use(
    cron({
      name: "Bot Betting",
      pattern: "*/10 * * * * *",
      run: async () => {
        await simulationService.simulateRandomBet();

        // 30% de chance de ter uma segunda aposta no mesmo ciclo
        if (Math.random() > 0.7) {
          await simulationService.simulateRandomBet(); // Simula uma segunda aposta aleatória
        }
      },
    }),
  )

  .get("/simulation/force-bet", async () => {
    await simulationService.ensureBots(5);
    await simulationService.simulateRandomBet();
    return { message: "Aposta simulada forçada com sucesso" };
  });
