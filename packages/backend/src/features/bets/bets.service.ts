import { and, eq, sql } from "drizzle-orm";
import type { DbInstance } from "../../plugins/db";
import { bets, users, draws } from "../../schema";

export class BetsService {
  private db: DbInstance;

  constructor(db: DbInstance) {
    this.db = db;
  }

  async createBet(data: {
    userId: string;
    drawId: number;
    betor: string;
    animal: string;
    betType: string;
    value: number;
    number?: number;
  }) {
    const result = await this.db.insert(bets).values(data).returning();
    const createdBet = result[0];

    const betWithRelations = await this.db
      .select({
        id: bets.id,
        userId: bets.userId,
        drawId: bets.drawId,
        betor: bets.betor,
        animal: bets.animal,
        betType: bets.betType,
        value: bets.value,
        number: bets.number,
        createdAt: bets.createdAt,

        // Dados do usuário
        userId_rel: users.id,
        username: users.username,
        email: users.email,

        // Dados do sorteio
        drawId_rel: draws.id,
        drawIdentifier: draws.identifier,
        drawStatus: draws.status,
      })
      .from(bets)
      .leftJoin(users, eq(bets.userId, users.id))
      .leftJoin(draws, eq(bets.drawId, draws.id))
      .where(eq(bets.id, createdBet.id))
      .limit(1);

    const formattedBet = betWithRelations.map(row => ({
      id: row.id,
      userId: row.userId,
      drawId: row.drawId,
      betor: row.betor,
      animal: row.animal,
      betType: row.betType,
      value: row.value,
      number: row.number,
      createdAt: row.createdAt,
      user: row.userId_rel ? {
        id: row.userId_rel,
        username: row.username,
        email: row.email,
      } : null,
      draw: row.drawId_rel ? {
        id: row.drawId_rel,
        identifier: row.drawIdentifier,
        status: row.drawStatus,
      } : null,
    }))[0];

    console.log("Aposta criada com relacionamentos:", formattedBet);
    return formattedBet;
  }

  async getBetsByUser(userId: string) {
    const result = await this.db
      .select({
        id: bets.id,
        userId: bets.userId,
        drawId: bets.drawId,
        betor: bets.betor,
        animal: bets.animal,
        betType: bets.betType,
        value: bets.value,
        number: bets.number,
        createdAt: bets.createdAt,

        // Dados do usuário
        userId_rel: users.id,
        username: users.username,
        email: users.email,

        // Dados do sorteio
        drawId_rel: draws.id,
        drawIdentifier: draws.identifier,
        drawStatus: draws.status,
      })
      .from(bets)
      .leftJoin(users, eq(bets.userId, users.id))
      .leftJoin(draws, eq(bets.drawId, draws.id))
      .where(eq(bets.userId, userId))
      .orderBy(bets.createdAt);

    const formattedResult = result.map(row => ({
      id: row.id,
      userId: row.userId,
      drawId: row.drawId,
      betor: row.betor,
      animal: row.animal,
      betType: row.betType,
      value: row.value,
      number: row.number,
      createdAt: row.createdAt,
      user: row.userId_rel ? {
        id: row.userId_rel,
        username: row.username,
        email: row.email,
      } : null,
      draw: row.drawId_rel ? {
        id: row.drawId_rel,
        identifier: row.drawIdentifier,
        status: row.drawStatus,
      } : null,
    }));

    console.log(`Buscando apostas para userId: ${userId}, encontradas: ${formattedResult.length}`);
    console.log("Primeira aposta formatada:", formattedResult[0]);
    return formattedResult;
  }

  async getBetsByDraw(drawId: number) {
    const result = await this.db.query.bets.findMany({
      where: eq(bets.drawId, drawId),
      with: {
        draw: true,
        user: true,
      },
    });
    return result;
  }

  async getTotalValueByDraw(drawId: number) {
    const result = await this.db
      .select({
        total: sql<number>`SUM(${bets.value})`,
      })
      .from(bets)
      .where(eq(bets.drawId, drawId));

    return result[0]?.total || 0;
  }

  async deleteBet(betId: number, userId: string) {
    return this.db
      .delete(bets)
      .where(and(eq(bets.id, betId), eq(bets.userId, userId)));
  }
}