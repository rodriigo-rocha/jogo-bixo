import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { dbPlugin } from "../../plugins/db";
import { loggerPlugin } from "../../plugins/logger";
import { permPlugin } from "../../plugins/permission";
import { UserService } from "./users.service";

export const userRoutes = new Elysia({
  prefix: "/users",
  tags: ["Users"],
})
  .use(loggerPlugin)
  .use(dbPlugin)
  .use(authPlugin)
  .derive(({ db }) => { // Injetando UserService nas rotas
    const userService = new UserService(db);

    return { userService };
  })
  .get( "/me", async ({ user, userService, set }) => { // Verifica se o usuário está autenticado
      const dbUser = await userService.findById(user!.id); // Busca o usuário no banco de dados

      if (!dbUser) {
        set.status = 401;
        return { message: "Não autorizado" };
      }

      // Retorna os dados do usuário (excluindo informações sensíveis)
      return {
        id: dbUser!.id,
        username: dbUser!.username,
        avatar: dbUser!.avatar_url,
        email: dbUser!.email,
        role: dbUser!.role,
        balance: dbUser!.balance,
      };
    },
    {
      verifyAuth: true, // Garante que a rota exige autenticação
      detail: { // Documentação OpenAPI para a rota /users/me
        description: "Retorna informações sobre o usuário atual",
        responses: {
          "200": {
            description: "Sucesso",
            content: {
              "application/json": {
                schema: t.Object({
                  id: t.String(),
                  username: t.String(),
                  avatar: t.String(),
                  email: t.String(),
                  role: t.String(),
                }),
              },
            },
          },

          "401": { description: "Token inválido ou não fornecido" },
        },
        security: [{ bearerAuth: [] }],
      },
    },
  )
  .group("/admin", (app) =>
    app.use(permPlugin).get(
      "/",
      async ({ userService, query }) => {
        return await userService.findAllUsers(query);
      },
      {
        isAdmin: true,
        query: t.Object({
          username: t.Optional(
            t.String({ description: "Filtrar por nome (parcial)" }),
          ),
          email: t.Optional(
            t.String({ description: "Filtrar por email (parcial)" }),
          ),
          role: t.Optional(
            t.Enum(
              { admin: "admin", player: "player" },
              { description: "Filtrar por cargo" },
            ),
          ),
          sortBy: t.Optional(
            t.Enum(
              { username: "username", balance: "balance" },
              { default: "username" },
            ),
          ),
          order: t.Optional(
            t.Enum({ asc: "asc", desc: "desc" }, { default: "desc" }),
          ),
          page: t.Optional(t.Integer({ minimum: 0, default: 0 })),
        }),
        detail: { summary: "Listar usuários com filtros" },
      },
    ),
  );
