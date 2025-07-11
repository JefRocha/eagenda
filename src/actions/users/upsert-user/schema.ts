import { z } from "zod";

export const upsertUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  role: z.enum(["USER", "MASTER"]),
  password: z
    .string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .optional()
    .or(z.literal("")), // Permite string vazia para senha opcional
  confirmPassword: z
    .string()
    .min(8, { message: "A confirmação da senha deve ter pelo menos 8 caracteres." })
    .optional()
    .or(z.literal("")), // Permite string vazia para confirmação de senha opcional
    permissions: z.array(z.string()).optional(),
});

export type UpsertUserSchema = z.infer<typeof upsertUserSchema>;
