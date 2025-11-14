import { jwt } from "@elysiajs/jwt";
import Elysia, { t } from "elysia";

// Plugin para autenticação da API
// Ele injeta `jwt` e `user` nas rotas
//
// É possível ter uma validação de autenticação usando { verifyAuth: true } após callback da rota.
// Exemplo em ../features/users/users.route.ts para a rota /users/me
export const authPlugin = new Elysia({ name: "plugin-auth" })
  .use(
    jwt({
      name: "jwt",
      secret: "jogo-do-bixo-omaga",
      schema: t.Object({
        id: t.String(),
        username: t.String(),
      }),
    }),
  )
  .derive({ as: "scoped" }, async ({ jwt, headers }) => {
    const auth = headers.authorization;

    if (!auth) return { user: null };

    const token = auth.replace("Bearer ", "");
    const payload = await jwt.verify(token);

    if (!payload) return { user: null };

    return {
      user: {
        id: payload.id,
        username: payload.username,
      },
    };
  })
  .macro({
    verifyAuth: {
      beforeHandle: ({ user, set }) => {
        if (!user) {
          set.status = 401;
          return {
            message: "Token inválido ou não fornecido",
          };
        }
      },
    },
  });
