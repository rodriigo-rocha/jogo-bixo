import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  pfp: text("pfp"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
