import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { draws } from "./draw.schema";
import { users } from "./user.schema";

export const bets = sqliteTable("bets", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  drawId: text("draw_id").references(() => draws.id),

  amount: integer("amount").notNull(),
  potentialWin: integer("potential_win").notNull(),

  type: text("type", { enum: ["GRUPO", "DEZENA", "CENTENA", "MILHAR"] }).notNull(),
  selection: integer("selection").notNull(),
  betor: text("betor"),
  status: text("status", { enum: ["PENDING", "WON", "LOST"] })
    .default("PENDING")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, { fields: [bets.userId], references: [users.id] }),
  draw: one(draws, { fields: [bets.drawId], references: [draws.id] }),
}));

export type BetsType = "GRUPO" | "DEZENA" | "CENTENA" | "MILHAR";
export type BetsStatus = "PENDING" | "WON" | "LOST";
