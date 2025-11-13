import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema/index.ts",
  out: "./src/schema/migrations",
  dbCredentials: {
    url: "./db.sqlite",
  },
  dialect: "sqlite",
} satisfies Config;
