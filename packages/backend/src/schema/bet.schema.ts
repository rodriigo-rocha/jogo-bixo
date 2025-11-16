import { relations, sql } from "drizzle-orm"; // Importar o `sql`
import {
  integer,
  real,
  sqliteTable,
  text,
  index,
} from "drizzle-orm/sqlite-core";

import { users } from "./user.schema";
import { draws } from "./draw.schema";

export const bets = sqliteTable(
  "bets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    drawId: integer("draw_id")
      .notNull()
      .references(() => draws.id),
    betor: text("betor"),
    animal: text("animal").notNull(),
    betType: text("bet_type").notNull(),
    value: real("value").notNull(),
    number: integer("number"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.userId),
    drawIdx: index("draw_idx").on(table.drawId),
  }),
);

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
  draw: one(draws, {
    fields: [bets.drawId],
    references: [draws.id],
  }),
}));
