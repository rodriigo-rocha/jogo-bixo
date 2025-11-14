import { uuidv7 } from "uuidv7";
import type { DbInstance } from "../../plugins/db";
import { type User, users } from "../../schema";

export class UserService {
  private db: DbInstance;

  constructor(db: DbInstance) {
    this.db = db;
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

  async create(data: Omit<User, "id">) {
    const newUser = {
      id: uuidv7(),
      ...data,
    };

    const created = await this.db.insert(users).values(newUser).returning();

    return created[0];
  }
}
