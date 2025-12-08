import { sql } from "drizzle-orm";
import type { DbInstance } from "../../plugins/db";
import { bets, draws } from "../../schema";

// Serviço para performance de apostas (gráficos e estatísticas)
export class PerformanceService {
  constructor(private db: DbInstance) { }

  // Buscar estatísticas de apostas em sorteios abertos para um usuário
  async getOpenDrawsStats(userId: string) {
    console.log("Buscando stats para userId:", userId);

    const openDraws = await this.db
      .select({ id: draws.id })
      .from(draws)
      .where(sql`${draws.status} = 'OPEN'`);
    console.log("Sorteios abertos:", openDraws);

    const openDrawIds = openDraws.map(d => d.id);
    console.log("IDs dos sorteios abertos:", openDrawIds);

    if (openDrawIds.length === 0) {
      console.log("Nenhum sorteio aberto");
      return { totalBets: 0, totalValue: 0 };
    }

    // Buscar apostas para sorteios abertos por este usuário
    const result = await this.db
      .select({
        totalValue: sql<number>`coalesce(sum(${bets.amount}), 0)`.mapWith(Number),
        totalBets: sql<number>`count(${bets.id})`.mapWith(Number),
      })
      .from(bets)
      .where(sql`${bets.userId} = ${userId} and ${bets.drawId} in (${sql.join(openDrawIds, sql`, `)}) and ${bets.status} = 'PENDING'`);
    console.log("Result:", result);

    return result[0] ?? { totalValue: 0, totalBets: 0 };
  }

  // Buscar performance de apostas em um mês específico
  async getPerformance(month: string) {
    console.log("Mês recebido:", month);
    const [year, monthNumber] = month.split("-").map(Number);

    const totalBetsResult = await this.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(bets);
    const totalBets = totalBetsResult[0]?.count || 0;
    console.log("Total de apostas no banco:", totalBets);

    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0, 23, 59, 59);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    console.log(
      "Start timestamp:",
      startTimestamp,
      "End timestamp:",
      endTimestamp,
    );

    // Buscar performance total no mês
    const result = await this.db
      .select({
        totalValue: sql<number>`coalesce(sum(${bets.amount}), 0)`.mapWith(Number),
        totalBets: sql<number>`count(${bets.id})`.mapWith(Number),
      })
      .from(bets)
      .where(sql`${bets.createdAt} >= ${startTimestamp} and ${bets.createdAt} <= ${endTimestamp}`);

    console.log("Resultado total:", result[0]);

    // Buscar performance diária no mês
    const dailyPerformance = await this.db
      .select({
        day: sql<string>`strftime('%d', ${bets.createdAt}, 'unixepoch')`,
        value: sql<number>`sum(${bets.amount})`.mapWith(Number),
      })
      .from(bets)
      .where(sql`${bets.createdAt} >= ${startTimestamp} and ${bets.createdAt} <= ${endTimestamp}`)
      .groupBy(sql`strftime('%d', ${bets.createdAt}, 'unixepoch')`);

    console.log("Resultado diário:", dailyPerformance);

    return {
      performance: result[0] ?? { totalValue: 0, totalBets: 0 },
      dailyPerformance,
    };
  }
}
