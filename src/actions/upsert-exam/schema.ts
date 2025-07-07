import { z } from "zod";

export const upsertExamSchema = z.object({
  id: z.string().optional(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  validade: z.coerce.number().min(0, "Validade deve ser um número positivo"),
  validade1: z.coerce.number().min(0, "Validade 1 deve ser um número positivo"),
  valor: z.coerce.number().min(0, "Valor deve ser um número positivo"),
  pedido: z.enum(["Sim", "Não"], { required_error: "Pedido é obrigatório" }),
  codigoAnterior: z.string().optional(),
  tipo: z.enum(["Admissional", "Demissional"], {
    required_error: "Tipo é obrigatório",
  }),
});
