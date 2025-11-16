import { sql } from "drizzle-orm";
import type { DbInstance } from "../../plugins/db";
import { bets } from "../../schema";

export class PerformanceService {
  constructor(private db: DbInstance) {}

  async getPerformance(month: string) {
    console.log("Mês recebido:", month);
    const [year, monthNumber] = month.split("-").map(Number);

    const totalBetsResult = await this.db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(bets); //nº total de apostas
    const totalBets = totalBetsResult[0]?.count || 0;
    console.log("Total de apostas no banco:", totalBets);

    // O SQLite armazena timestamps como segundos desde a época.
    // Precisamos calcular o início e o fim do mês em segundos.
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0, 23, 59, 59);

    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);
    console.log("Start timestamp:", startTimestamp, "End timestamp:", endTimestamp);

    const result = await this.db
      .select({
        totalValue: sql<number>`coalesce(sum(${bets.value}), 0)`.mapWith(Number),
        totalBets: sql<number>`count(${bets.id})`.mapWith(Number),
      })
      .from(bets)
      .where(
        sql`${bets.createdAt} >= ${startTimestamp} and ${bets.createdAt} <= ${endTimestamp}`,
      );

    console.log("Resultado total:", result[0]);

    const dailyPerformance = await this.db
      .select({
        day: sql<string>`strftime('%d', ${bets.createdAt}, 'unixepoch')`,
        value: sql<number>`sum(${bets.value})`.mapWith(Number),
      })
      .from(bets)
      .where(
        sql`${bets.createdAt} >= ${startTimestamp} and ${bets.createdAt} <= ${endTimestamp}`,
      )
      .groupBy(sql`strftime('%d', ${bets.createdAt}, 'unixepoch')`); // Agrupa por dia do mês

    console.log("Resultado diário:", dailyPerformance);

    return {
      performance: result[0] ?? { totalValue: 0, totalBets: 0 },
      dailyPerformance,
    };
  }
}
