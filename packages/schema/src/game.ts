import z from "zod";

export const BetTypeEnum = z.enum(["GRUPO", "DEZENA", "CENTENA", "MILHAR"]);

export const GAME_ODDS = {
  GRUPO: 18,
  DEZENA: 60,
  CENTENA: 300,
  MILHAR: 4000,
};

export const CreateBetSchema = z
  .object({
    drawId: z.string(),
    betor: z.string().min(1, "Nome do apostador é obrigatório"),
    amount: z
      .number()
      .int("O valor deve ser um número inteiro (reais)")
      .min(1, "Aposta mínima de R$ 1,00"),
    type: BetTypeEnum,
    selection: z.number().nonnegative(),
  })
  .refine(
    (data) => {
      if (data.type === "GRUPO")
        return data.selection >= 1 && data.selection <= 25;
      return true;
    },
    { message: "Número inválido para o tipo de aposta selecionado" },
  ); export type CreateBet = z.infer<typeof CreateBetSchema>;

export const DrawResultSchema = z.object({
  number: z.string().length(4),
  createdAt: z.date(),
});
