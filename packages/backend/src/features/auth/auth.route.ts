import { LoginSchema, RegisterSchema } from "@jogo-do-bixo/schema";
import Elysia, { t } from "elysia";
import { authPlugin } from "../../plugins/auth";
import { dbPlugin } from "../../plugins/db";
import { UserService } from "../users/users.service";
import { AuthService } from "./auth.service";

export const authRoutes = new Elysia({
  prefix: "/auth",
  tags: ["Authentication"],
})
  .use(dbPlugin)
  .use(authPlugin)
  .derive(({ db }) => {
    const userService = new UserService(db);

    return {
      authService: new AuthService(userService),
      userService,
    };
  })
  .post(
    "/register",
    async ({ authService, jwt, body, set }) => {
      const user = await authService.register(body);

      const token = await jwt.sign({
        id: user.id,
        username: user.username,
      });

      set.status = 201;
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar_url,
        },
      };
    },
    {
      body: RegisterSchema,
      detail: {
        description: "Registrar um novo usuário",
        responses: {
          "201": {
            description: "Usuário registrado",
            content: {
              "application/json": {
                schema: t.Object({
                  token: t.String(),
                  user: t.Object({
                    id: t.String(),
                    username: t.String(),
                    email: t.String(),
                    avatar: t.String(),
                  }),
                }),
              },
            },
          },
          "409": {
            description: "Email já registrado",
            content: {
              "application/json": {
                schema: t.Object({
                  message: t.String({ default: "Este email já está em uso" }),
                }),
              },
            },
          },
        },
      },
    },
  )
  .post(
    "/login",
    async ({ authService, jwt, body }) => {
      const user = await authService.login(body);

      const token = await jwt.sign({
        id: user.id,
        username: user.username,
      });

      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar_url,
        },
      };
    },
    {
      body: LoginSchema,
      detail: {
        description: "Entrar como usuário",
        responses: {
          "200": {
            description: "Sucesso",
            content: {
              "application/json": {
                schema: t.Object({
                  token: t.String(),
                  user: t.Object({
                    id: t.String(),
                    username: t.String(),
                    email: t.String(),
                    avatar: t.String(),
                  }),
                }),
              },
            },
          },

          "401": {
            description: "Não autorizado",
          },
        },
      },
    },
  );
