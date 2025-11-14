import { z } from "zod";

export * from "./auth.js";

export const UserSchema = z.object({
  id: z.uuidv7(),
  username: z.string().min(3, "O usuário precisa ter pelo menos 3 caracteres."),
  email: z.email("Formato de e-mail inválido."),
});

export type User = z.infer<typeof UserSchema>;

export { z } from "zod";
