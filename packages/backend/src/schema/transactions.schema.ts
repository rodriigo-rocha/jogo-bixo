import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./user.schema";

// Tabela de transações financeiras dos usuários
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),

  // Tipos de movimentação
  type: text("type", {
    enum: ["DEPOSIT", "WITHDRAW", "BET", "WIN", "REFUND"],
  }).notNull(),

  amount: integer("amount").notNull(),
  balanceAfter: integer("balance_after").notNull(),

  description: text("description").notNull(),
  referenceId: text("reference_id"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Relações entre transações e usuários
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export type TransactionType = "DEPOSIT" | "WITHDRAW" | "BET" | "WIN" | "REFUND";
