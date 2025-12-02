import { cron, Patterns } from "@elysiajs/cron";
import { Elysia } from "elysia";
import { db } from "../../plugins/db";
import { SimulationService } from "./simulation.service";

const simulationService = new SimulationService(db);

(async () => {
  await simulationService.ensureBots(20);
})();

export const simulationCron = new Elysia()
  // Faz um bot aleatório jogar.
  .use(
    cron({
      name: "Bot Betting",
      pattern: "*/10 * * * * *", // A cada 10 segundos
      run: async () => {
        await simulationService.simulateRandomBet();

        // 30% de chance de ter uma segunda aposta no mesmo ciclo
        if (Math.random() > 0.7) {
          await simulationService.simulateRandomBet();
        }
      },
    }),
  )

  // Endpoint para forçar simulação
  .get("/simulation/force-bet", async () => {
    await simulationService.ensureBots(5);
    await simulationService.simulateRandomBet();
    return { message: "Aposta simulada forçada com sucesso" };
  });
