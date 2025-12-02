import { cron, Patterns } from "@elysiajs/cron";
import chalk from "chalk";
import { Elysia, t } from "elysia";
import { intToDecimal } from "../../helpers/formatters";
import { authPlugin } from "../../plugins/auth";
import { db, dbPlugin } from "../../plugins/db";
import { logger } from "../../plugins/logger";
import { permPlugin } from "../../plugins/permission";
import type { BetsStatus } from "../../schema";
import { GameService } from "./game.service";

export const gameRoutes = new Elysia({
  prefix: "/game",
  tags: ["Game"],
})
  .use(dbPlugin)
  .use(authPlugin)
  .derive(({ db }) => ({
    gameService: new GameService(db),
  }))
  .use(
    cron({
      name: "Gerar resultado",
      pattern: Patterns.everyMinutes(5),
      run: async () => {
        // Temporariamente desabilitado para não interferir com sorteios manuais
        /*
        const gameService = new GameService(db);

        const { winners, totalPaid, draw } = await gameService.executeDraw();
        logger.info(
          `${chalk.yellow(`[${draw}]`)} Sorteio realizado. ${chalk.green(winners)} vencedores (${chalk.red(`-R$${intToDecimal(totalPaid)}`)})`,
        );
        */
      },
    }),
  )

  .get(
    "/results",
    async ({ gameService }) => {
      return await gameService.getLatestDraws();
    },
    {
      detail: { summary: "Últimos Resultados" },
    },
  )

  .post(
    "/bet",
    async ({ user, body, gameService }) => {
      const bet = await gameService.placeBet(user!.id, body);
      return { success: true, bet };
    },
    {
      verifyAuth: true,
      body: t.Object({
        drawId: t.String(),
        betor: t.String(),
        amount: t.Number({ minimum: 1 }),
        type: t.Enum({ GRUPO: "GRUPO", DEZENA: "DEZENA", CENTENA: "CENTENA", MILHAR: "MILHAR" }),
        selection: t.Number(),
      }),
      detail: {
        summary: "Realizar Aposta",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  .put(
    "/bet/:id",
    async ({ user, params, body, gameService }) => {
      const bet = await gameService.updateBet(user!.id, params.id, body);
      return { success: true, bet };
    },
    {
      verifyAuth: true,
      params: t.Object({ id: t.String() }),
      body: t.Object({
        amount: t.Optional(t.Number({ minimum: 100 })),
        type: t.Optional(t.Enum({ GRUPO: "GRUPO", DEZENA: "DEZENA", CENTENA: "CENTENA", MILHAR: "MILHAR" })),
        selection: t.Optional(t.Number()),
      }),
      detail: {
        summary: "Editar Aposta (só se PENDING)",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  .delete(
    "/bet/:id",
    async ({ user, params, gameService }) => {
      return await gameService.deleteBet(user!.id, params.id);
    },
    {
      verifyAuth: true,
      params: t.Object({ id: t.String() }),
      detail: {
        summary: "Excluir Aposta (só se PENDING, reembolsa saldo)",
        security: [{ bearerAuth: [] }],
      },
    },
  )

  .get(
    "/my-bets",
    async ({ user, gameService, query }) => {
      return await gameService.getUserBets(user!.id, query.page);
    },
    {
      verifyAuth: true,
      detail: {
        summary: "Minhas Apostas",
        security: [{ bearerAuth: [] }],
      },
      query: t.Object({
        page: t.Optional(t.Integer({ minimum: 0, default: 0 })),
      }),
    },
  )

  .get(
    "/my-transactions",
    async ({ user, gameService, query }) => {
      return await gameService.getUserTransactions(user!.id, query.page);
    },
    {
      verifyAuth: true,
      detail: {
        summary: "Meu Extrato Financeiro",
        description:
          "Histórico de entradas e saídas (apostas, prêmios, depósitos).",
        security: [{ bearerAuth: [] }],
      },
      query: t.Object({
        page: t.Optional(t.Integer({ minimum: 0, default: 0 })),
      }),
    },
  )

  .group("/admin", (app) =>
    app
      .use(permPlugin)

      .post(
        "/draw",
        async ({ gameService }) => {
          const result = await gameService.executeDraw();
          return { message: "Sorteio realizado!", data: result };
        },
        {
          isAdmin: true,
          detail: { summary: "Rodar Sorteio (Admin)" },
        },
      )

      .post(
        "/draw/:id/execute",
        async ({ params, gameService }) => {
          const result = await gameService.executeSpecificDraw(params.id);
          return { message: "Sorteio realizado!", data: result };
        },
        {
          isAdmin: true,
          params: t.Object({ id: t.String() }),
          detail: { summary: "Executar Sorteio Específico (Admin)" },
        },
      )

      .post(
        "/draw/open",
        async ({ body, gameService }) => {
          const draw = await gameService.createOpenDraw(body);
          return { success: true, draw };
        },
        {
          isAdmin: true,
          body: t.Object({
            number: t.Optional(t.String()),
            city: t.Optional(t.String()),
            temperature: t.Optional(t.Number()),
            humidity: t.Optional(t.Number()),
            windSpeed: t.Optional(t.Number()),
          }),
          detail: { summary: "Criar Sorteio Aberto (Admin)" },
        },
      )

      .put(
        "/draw/:id",
        async ({ params, body, gameService }) => {
          const draw = await gameService.updateDraw(params.id, body);
          return { success: true, draw };
        },
        {
          isAdmin: true,
          params: t.Object({ id: t.String() }),
          body: t.Object({
            number: t.Optional(t.String()),
            city: t.Optional(t.String()),
            temperature: t.Optional(t.Number()),
            humidity: t.Optional(t.Number()),
            windSpeed: t.Optional(t.Number()),
          }),
          detail: { summary: "Editar Sorteio (só se OPEN)" },
        },
      )

      .delete(
        "/draw/:id",
        async ({ params, gameService }) => {
          return await gameService.deleteDraw(params.id);
        },
        {
          isAdmin: true,
          params: t.Object({ id: t.String() }),
          detail: { summary: "Excluir Sorteio (só se OPEN e sem apostas)" },
        },
      )

      .get(
        "/bets",
        async ({ gameService, query }) => {
          const filters = {
            status: query.status as BetsStatus,
            userId: query.userId,
            drawId: query.drawId,
            page: query.page!,
            startDate: query.startDate ? new Date(query.startDate) : undefined,
            endDate: query.endDate ? new Date(query.endDate) : undefined,
          };
          return await gameService.getAdminBets(filters);
        },
        {
          isAdmin: true,
          query: t.Object({
            status: t.Optional(t.String()),
            userId: t.Optional(t.String()),
            drawId: t.Optional(t.String()),
            startDate: t.Optional(t.String({ format: "date-time" })),
            endDate: t.Optional(t.String({ format: "date-time" })),
            page: t.Optional(t.Integer({ minimum: 0, default: 0 })),
          }),
          detail: {
            summary: "Listar Todas Apostas (Admin)",
            description: "Permite filtrar por status, usuário, sorteio e data.",
          },
        },
      )

      .get(
        "/transactions",
        async ({ gameService, query }) => {
          return await gameService.getAdminTransactions(query);
        },
        {
          isAdmin: true,
          query: t.Object({
            userId: t.Optional(t.String()),
            page: t.Optional(t.Integer({ minimum: 0, default: 0 })),
            type: t.Optional(
              t.Enum({
                BET: "BET",
                WIN: "WIN",
                DEPOSIT: "DEPOSIT",
                WITHDRAW: "WITHDRAW",
                REFUND: "REFUND",
              }),
            ),
          }),
          detail: {
            summary: "Listar Todas Transações (Admin)",
            description: "Auditoria financeira completa.",
          },
        },
      ),
  );
