import { and, eq } from "drizzle-orm";
import type { DbInstance } from "../../plugins/db";
import { draws } from "../../schema";

export class DrawService {
  private db: DbInstance;

  constructor(db: DbInstance) {
    this.db = db;
  }

  async createDraw(data: { userId: string; identifier: number }) {
    const existing = await this.db.query.draws.findFirst({
      // vendo se existe já ou não
      where: eq(draws.identifier, data.identifier),
    });

    if (existing) {
      throw new Error("Identificador do sorteio já existe");
    }

    const result = await this.db
      .insert(draws)
      .values({
        ...data,
        status: "open",
      })
      .returning();

    return result[0];
  }

  async getDrawsByUser(userId: string) {
    return await this.db.query.draws.findMany({
      where: eq(draws.userId, userId),
      orderBy: (draws, { desc }) => [desc(draws.createdAt)],
    });
  }

  async getDraw(identifier: number) {
    return await this.db.query.draws.findFirst({
      where: eq(draws.identifier, identifier),
    });
  }

  async closeDraw(identifier: number, userId: string) {
    const result = await this.db
      .update(draws)
      .set({
        status: "closed",
        closedAt: new Date(),
      })
      .where(and(eq(draws.identifier, identifier), eq(draws.userId, userId)))
      .returning();

    if (result.length === 0) {
      throw new Error(
        "Sorteio não encontrado ou você não tem permissão para fechá-lo",
      );
    }

    return result[0];
  }

  async getAllDraws(userId: string) {
    return await this.db.query.draws.findMany({
      where: eq(draws.userId, userId),
      orderBy: (draws, { desc }) => [desc(draws.identifier)],
    });
  }
}
