import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { openapi } from "@elysiajs/openapi";
import { z } from "@jogo-do-bixo/schema";
import { Elysia, t } from "elysia";
import { BaseHttpError } from "./error";
import { authRoutes } from "./features/auth/auth.route";
import { betsRoutes } from "./features/bets/bets.route";
import { drawRoutes } from "./features/draws/draw.route";
import { performanceRoutes } from "./features/performance/performance.route";
import { userRoutes } from "./features/users/users.route";
import { dbPlugin } from "./plugins/db";
import { loggerPlugin } from "./plugins/logger";

const app = new Elysia({ adapter: node() });

// Plugins
app
  .use(loggerPlugin)
  .onError(({ code, error, set, logger }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        message: "Erro de validação",
        errors: error.all.map((e) => e.summary),
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        message: "Não encontrado",
      };
    }

    if (error instanceof BaseHttpError) {
      set.status = error.status;
      return {
        message: error.message,
      };
    }

    logger.error(error);
    set.status = 500;
    return {
      message: "Ocorreu um erro interno no servidor.",
    };
  })
  .use(cors())
  .use(
    openapi({
      documentation: {
        info: {
          title: "API Jogo do Bixo",
          description: "Essa é a api aí 👍",
          version: "1.0.0",
        },
        tags: [
          {
            name: "Users",
            description: "Rotas relacionadas com usuários",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
      },
      mapJsonSchema: { zod: z.toJSONSchema },
    }),
  )
  .use(dbPlugin);

// Rotas
app
  .use(userRoutes)
  .use(authRoutes)
  .use(betsRoutes)
  .use(drawRoutes)
  .use(performanceRoutes)
  .get(
    "/",
    () => ({
      status: "ok",
    }),
    {
      detail: {
        summary: "Healthcheck",
        responses: {
          "200": {
            description: "Sucesso",
            content: {
              "application/json": {
                schema: t.Object({
                  status: t.String({ default: "ok" }),
                }),
              },
            },
          },
        },
      },
    },
  )
  .listen(3000);
