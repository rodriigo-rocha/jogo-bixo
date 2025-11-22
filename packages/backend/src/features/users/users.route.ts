import { Elysia, t } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { dbPlugin } from "../../plugins/db";
import { loggerPlugin } from "../../plugins/logger";
import { UserService } from "./users.service";

export const userRoutes = new Elysia({
  prefix: "/users",
  tags: ["Users"],
})
  .use(loggerPlugin)
  .use(dbPlugin)
  .use(authPlugin)
  .derive(({ db }) => {
    const userService = new UserService(db);

    return {
      userService,
    };
  })
  .get(
    "/me",
    async ({ user, userService }) => {
      const dbUser = await userService.findById(user!.id);

      return {
        id: dbUser!.id,
        username: dbUser!.username,
        avatar: dbUser!.avatar_url,
        email: dbUser!.email,
      };
    },
    {
      verifyAuth: true,
      detail: {
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
                }),
              },
            },
          },

          "401": {
            description: "Token inválido ou não fornecido",
          },
        },
        security: [{ bearerAuth: [] }],
      },
    },
  );
