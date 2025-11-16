import Elysia, { t } from "elysia";
import { UnauthorizedError } from "../../error";
import { authPlugin } from "../../plugins/auth";
import { dbPlugin } from "../../plugins/db";
import { DrawService } from "./draw.service";

export const drawRoutes = new Elysia({ prefix: "/draws" })
  .use(dbPlugin)
  .use(authPlugin)
  .derive(({ db }) => ({
    drawService: new DrawService(db),
  }))
  .onBeforeHandle(({ user }) => {
    if (!user) {
      throw new UnauthorizedError("Acesso não autorizado");
    }
  })
  .post(
    "/",
    async ({ body, user, drawService }) => {
      if (!user) {
        throw new UnauthorizedError("Usuário não encontrado na requisição");
      }
      return await drawService.createDraw({
        userId: user.id,
        identifier: body.identifier,
      });
    },
    {
      body: t.Object({
        identifier: t.Number({ minimum: 1 }),
      }),
    },
  )
  .get("/", async ({ user, drawService }) => {
    if (!user) {
      throw new UnauthorizedError("Usuário não encontrado na requisição");
    }
    return await drawService.getAllDraws(user.id);
  })
  .get("/:identifier", async ({ params, drawService }) => {
    const identifier = Number(params.identifier);
    if (isNaN(identifier)) {
      throw new Error("Identificador do sorteio inválido");
    }
    return await drawService.getDraw(identifier);
  })
  .patch("/:identifier/close", async ({ params, user, drawService }) => {
    if (!user) {
      throw new UnauthorizedError("Usuário não encontrado na requisição");
    }
    const identifier = Number(params.identifier);
    if (isNaN(identifier)) {
      throw new Error("Identificador do sorteio inválido");
    }
    return await drawService.closeDraw(identifier, user.id);
  });