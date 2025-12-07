import { Elysia, t } from "elysia";
import { UnauthorizedError } from "../../error";
import { authPlugin } from "../../plugins/auth";
import { dbPlugin } from "../../plugins/db";
import { PerformanceService } from "./performance.service";

export const performanceRoutes = new Elysia({
  prefix: "/performance",
})
  .use(dbPlugin)
  .use(authPlugin)
  .derive(({ db }) => ({
    performanceService: new PerformanceService(db),
  }))
  .onBeforeHandle(({ user }) => {
    if (!user) {
      throw new UnauthorizedError("Acesso não autorizado");
    }
  })
  
  // Buscar performance de apostas em um mês específico
  .get( "/", async ({ query, performanceService, user }) => {
      const { month } = query;
      console.log("Buscando performance para o mês:", month);
      const result = await performanceService.getPerformance(month);
      console.log("Resultado da performance:", result);
      return result;
    },
    {
      query: t.Object({
        month: t.String({
          pattern: "^\\d{4}-\\d{2}$",
          error: "O formato do mês deve ser YYYY-MM",
        }),
      }),
    },
  )

  // Buscar estatísticas de apostas em sorteios abertos para um usuário
  .get( "/open", async ({ performanceService, user }) => {
      const result = await performanceService.getOpenDrawsStats(user!.id);
      return result;
    },
  );
