import { z } from "zod";

export const upsertUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  role: z.enum(["USER", "MASTER"]),
});

export type UpsertUserSchema = z.infer<typeof upsertUserSchema>;
