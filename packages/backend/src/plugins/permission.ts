import Elysia from "elysia";
import { authPlugin } from "./auth";
import { dbPlugin } from "./db";

export const permPlugin = new Elysia({ name: "plugin-perm" })
  .use(authPlugin)
  .use(dbPlugin)
  .macro({
    isAdmin: {
      beforeHandle: async ({ user, set, db }) => {
        if (!user) {
          set.status = 401;
          return { message: "Token inválido ou não fornecido" };
        }

        const userDb = await db.query.users.findFirst({ // Buscar o usuário no banco de dados
          where: (u, { eq }) => eq(u.id, user.id),
          columns: { role: true },
        });

        if (!userDb) {
          set.status = 401;
          return { message: "Token inválido ou não fornecido" };
        }

        if (userDb.role !== "admin") {
          set.status = 403;
          return { message: "Sem permissão" };
        }
      },
    },
  });
