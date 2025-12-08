import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Tabela de sorteios do jogo
export const draws = sqliteTable("draws", {
  id: text("id").primaryKey(),
  number: text("number").notNull(),
  status: text("status", { enum: ["OPEN", "CLOSED"] })
    .default("CLOSED")
    .notNull(),
  city: text("city"),
  temperature: real("temperature"),
  humidity: integer("humidity"),
  windSpeed: real("wind_speed"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Draw = typeof draws.$inferSelect;
export type NewDraw = typeof draws.$inferInsert;
