import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { z } from "@jogo-do-bixo/schema";
import { Elysia } from "elysia";
import { userRoutes } from "./features/users/users.route";
import { dbPlugin } from "./plugins/db";
import { loggerPlugin } from "./plugins/logger";

const app = new Elysia({ adapter: node() });

// Plugins
app
  .use(loggerPlugin)
  .use(cors())
  .use(
    openapi({
      mapJsonSchema: { zod: z.toJSONSchema },
    }),
  )
  .use(dbPlugin);

// Rotas
app
  .use(userRoutes)
  .get("/", () => ({
    status: "ok",
  }))
  .listen(3000);
