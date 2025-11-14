import z from "zod";

export const AuthSchema = z.object({
  id: z.uuidv7(),
  username: z.string(),
  email: z.email(),
});

export type Auth = z.infer<typeof AuthSchema>;

export const LoginSchema = z.object({
  email: z.email("Email inválido").nonempty().trim(),
  password: z.string().nonempty().trim().min(8).max(50),
});

export type Login = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.email("Email inválido").nonempty().trim(),
  password: z.string().nonempty().trim().min(8).max(50),
  username: z.string().nonempty().trim(),
});

export type Register = z.infer<typeof RegisterSchema>;
