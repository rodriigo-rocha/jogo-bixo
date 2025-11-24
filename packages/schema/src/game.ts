import z from "zod";

export const BetTypeEnum = z.enum(["GRUPO", "DEZENA", "MILHAR"]);

export const GAME_ODDS = {
  GRUPO: 18,
  DEZENA: 60,
  MILHAR: 4000,
};

export const CreateBetSchema = z
  .object({
    amount: z
      .number()
      .int("O valor deve ser um número inteiro (centavos)")
      .min(100, "Aposta mínima de R$ 1,00 (100 centavos)"),
    type: BetTypeEnum,
    selection: z.number().nonnegative(),
  })
  .refine(
    (data) => {
      if (data.type === "GRUPO")
        return data.selection >= 1 && data.selection <= 25;
      if (data.type === "DEZENA")
        return data.selection >= 0 && data.selection <= 99;
      if (data.type === "MILHAR")
        return data.selection >= 0 && data.selection <= 9999;
      return false;
    },
    { message: "Número inválido para o tipo de aposta selecionado" },
  );

export type CreateBet = z.infer<typeof CreateBetSchema>;

export const DrawResultSchema = z.object({
  number: z.string().length(4),
  createdAt: z.date(),
});
