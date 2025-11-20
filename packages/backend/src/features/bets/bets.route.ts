import Elysia, { t } from "elysia";
import { UnauthorizedError } from "../../error";
import { authPlugin } from "../../plugins/auth";
import { dbPlugin } from "../../plugins/db";
import { BetsService } from "./bets.service";

export const betsRoutes = new Elysia({ prefix: "/bets" })
  .use(dbPlugin)
  .use(authPlugin)
  .derive(({ db }) => ({
    betsService: new BetsService(db),
  }))
  .onBeforeHandle(({ user }) => {
    if (!user) {
      throw new UnauthorizedError("Acesso não autorizado");
    }
  })
  .post(
    "/",
    async ({ body, betsService }) => {
      return betsService.createBet(body);
    },
    {
      body: t.Object({
        userId: t.String(),
        drawId: t.Number(),
        betor: t.String(),
        animal: t.String(),
        betType: t.String(),
        value: t.Numeric(),
        number: t.Optional(t.Numeric()),
      }),
    },
  )
  .put(
    "/:id",
    async ({ params, body, user, betsService }) => {
      if (!user) {
        throw new UnauthorizedError("Usuário não encontrado na requisição");
      }
      const betId = Number(params.id);
      if (Number.isNaN(betId)) {
        throw new Error("ID da aposta inválido");
      }
      return betsService.updateBet(betId, user.id, body);
    },
    {
      body: t.Object({
        drawId: t.Optional(t.Number()),
        betor: t.Optional(t.String()),
        animal: t.Optional(t.String()),
        betType: t.Optional(t.String()),
        value: t.Optional(t.Numeric()),
        number: t.Optional(t.Numeric()),
      }),
    },
  )
  .get("/draw/:drawId", async ({ params, betsService }) => {
    const drawId = Number(params.drawId);
    if (Number.isNaN(drawId)) {
      throw new Error("ID do sorteio inválido");
    }
    return betsService.getBetsByDraw(drawId);
  })
  .get("/draw/:drawId/total", async ({ params, betsService }) => {
    const drawId = Number(params.drawId);
    if (Number.isNaN(drawId)) {
      throw new Error("ID do sorteio inválido");
    }
    const total = await betsService.getTotalValueByDraw(drawId);
    return { total };
  })
  .get("/:userId", async ({ params, betsService }) => {
    return betsService.getBetsByUser(params.userId);
  })
  .delete("/:id", async ({ params, user, betsService }) => {
    if (!user) {
      throw new UnauthorizedError("Usuário não encontrado na requisição");
    }
    const betId = Number(params.id);
    if (Number.isNaN(betId)) {
      throw new Error("ID da aposta inválido");
    }
    await betsService.deleteBet(betId, user.id);
    return { message: "Aposta excluída com sucesso" };
  });
