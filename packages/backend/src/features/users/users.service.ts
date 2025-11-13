import type { Logger } from "pino";
import type { DbInstance } from "../../plugins/db";
import { type NewUser, users } from "../../schema";

export class UserService {
  private log: Logger;
  private db: DbInstance;

  // 3. Receba ambos no construtor
  constructor(log: Logger, db: DbInstance) {
    this.log = log.child({ service: "UserService" });
    this.db = db;
  }

  public async create(data: NewUser) {
    this.log.info("Iniciando criação de usuário...");

    try {
      const newUser = await this.db.insert(users).values(data).returning();

      this.log.info({ userId: newUser[0].id }, "Usuário criado com sucesso.");
      return newUser[0];
    } catch (err) {
      this.log.error(err, "Falha ao inserir usuário no banco.");
      throw new Error("Erro ao criar usuário.");
    }
  }

  public async findById(id: string) {
    this.log.info({ userId: id }, "Buscando usuário por ID");

    // Exemplo de busca
    const user = await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });

    if (!user) {
      this.log.warn({ userId: id }, "Usuário não encontrado");
      return null;
    }

    return user;
  }
}
