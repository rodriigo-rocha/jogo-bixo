import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Elysia } from "elysia";

import * as schema from "../schema";

const sqlite = new Database("db.sqlite");

const db = drizzle(sqlite, { schema });

export type DbInstance = typeof db;

export const dbPlugin = new Elysia({ name: "plugin-db" }).decorate("db", db);
