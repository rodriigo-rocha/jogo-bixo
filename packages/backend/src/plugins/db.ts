// Aqui é onde configuramos a conexão com o banco de dados usando Better SQLite3 e Drizzle ORM
// Drizzle ORM é uma biblioteca que facilita a interação com bancos de dados em TypeScript/JavaScript

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { Elysia } from "elysia";

import * as schema from "../schema";

const sqlite = new Database("db.sqlite");

// Cria a instância do Drizzle ORM com a conexão SQLite e o schema definido
export const db = drizzle(sqlite, { schema });

export type DbInstance = typeof db;

export const dbPlugin = new Elysia({ name: "plugin-db" }).decorate("db", db);