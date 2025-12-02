import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user.schema";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),

  // Tipos de movimentação
  type: text("type", {
    enum: ["DEPOSIT", "WITHDRAW", "BET", "WIN", "REFUND"],
  }).notNull(),

  amount: integer("amount").notNull(), // Valor sempre positivo
  balanceAfter: integer("balance_after").notNull(), // Saldo após a transação

  description: text("description").notNull(),
  referenceId: text("reference_id"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export type TransactionType = "DEPOSIT" | "WITHDRAW" | "BET" | "WIN" | "REFUND";
