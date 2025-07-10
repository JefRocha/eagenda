import { z } from "zod";

export const upsertUserSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Nome é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  role: z.enum(["USER", "MASTER"]),
  password: z
    .string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres." })
    .optional()
    .or(z.literal("")), // Permite string vazia para senha opcional
}).superRefine((data, ctx) => {
  if (!data.id && !data.password) { // Se estiver criando um novo usuário e nenhuma senha for fornecida
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A senha é obrigatória para novos usuários.",
      path: ["password"],
    });
  }
});

export type UpsertUserSchema = z.infer<typeof upsertUserSchema>;
