import { and, asc, desc, eq, like, type SQL } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import type { DbInstance } from "../../plugins/db";
import { type User, users } from "../../schema";
import { GameService } from "../game/game.service";

// Serviço responsável por operações relacionadas aos usuários
export class UserService {
  private gameService: GameService;

  constructor(private db: DbInstance) {
    this.gameService = new GameService(this.db);
  }

  async findByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
  }

  async findById(id: string) {
    return await this.db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
  }

  async findAllUsers(filters?: {
    username?: string;
    email?: string;
    role?: "admin" | "player";
    sortBy?: "username" | "balance";
    order?: "asc" | "desc";
    page?: number;
  }) {
    const conditions: SQL<unknown>[] = [];

    // Filtros de Texto (Parcial)
    if (filters?.username) {
      conditions.push(like(users.username, `%${filters.username}%`));
    }
    if (filters?.email) {
      conditions.push(like(users.email, `%${filters.email}%`));
    }
    // Filtro Exato
    if (filters?.role) {
      conditions.push(eq(users.role, filters.role));
    }

    const sortColumn = filters?.sortBy === "balance" ? users.balance : users.username;
    const sortDirection = filters?.order === "asc" ? asc : desc;

    return await this.db.query.users.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [sortDirection(sortColumn)],
      columns: {
        id: true,
        username: true,
        email: true,
        role: true,
        balance: true,
        avatar_url: true,
      },
      limit: 50,
      offset: 50 * (filters?.page ?? 0),
    });
  }

  async updateUser(
    id: string,
    data: Partial<Pick<User, "username" | "role" | "balance">>,
  ) {
    const updated = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated[0];
  }

  async create(data: Omit<User, "id">) {
    const newUser = {
      id: uuidv7(),
      ...data,
    };

    const created = await this.db.insert(users).values(newUser).returning();

    await this.gameService.logTransaction(
      newUser.id,
      "DEPOSIT",
      data.balance,
      "Saldo inicial",
    );

    return created[0];
  }
}
