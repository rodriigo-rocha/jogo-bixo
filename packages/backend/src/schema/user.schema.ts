import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatar_url: text("avatar_url"),
  role: text("role", { enum: ["admin", "player"] })
    .default("player")
    .notNull(),
  balance: int("balance").default(10000).notNull(), // Bônus inicial = 100.00
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
