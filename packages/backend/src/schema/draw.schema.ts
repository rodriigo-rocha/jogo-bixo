import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./user.schema";

export const draws = sqliteTable(
  "draws",
  {
    id: integer("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    identifier: integer("identifier").notNull().unique(),
    status: text("status").notNull().default("open"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    closedAt: integer("closed_at", { mode: "timestamp" }),
  },
  (table) => ({
    userIdx: index("draw_user_idx").on(table.userId),
    identifierIdx: index("draw_identifier_idx").on(table.identifier),
  }),
);

export const drawsRelations = relations(draws, ({ one }) => ({
  user: one(users, {
    fields: [draws.userId],
    references: [users.id],
  }),
}));

export type Draw = typeof draws.$inferSelect;
export type NewDraw = typeof draws.$inferInsert;
