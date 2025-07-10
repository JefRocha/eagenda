import { z } from "zod";

export const upsertUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  role: z.enum(["USER", "MASTER"]),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
    .optional(),
});

export type UpsertUserSchema = z.infer<typeof upsertUserSchema>;
