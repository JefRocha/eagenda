import { z } from "zod";
import { isValidCnpj, isValidCpf } from "@/helpers/validation";

export const upsertClientSchema = z.object({
  id: z.string().optional(),
  cpf: z.string().optional().nullable(),
  fantasia: z.string().min(1, "Nome Fantasia é obrigatório"),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  uf: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  moradia: z.coerce.number().optional().nullable(),
  tipo: z.coerce.number().optional().nullable(),
  situacao: z.coerce.number().optional().nullable(),
  telefone1: z.string().optional().nullable(),
  telefone2: z.string().optional().nullable(),
  telefone3: z.string().optional().nullable(),
  celular: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().nullable(),
  rg: z.string().optional().nullable(),
  estadoCivil: z.string().optional().nullable(),
  empresa: z.string().optional().nullable(),
  dataCadastro: z.coerce.date().optional().nullable(),
  dataUltimaCompra: z.coerce.date().optional().nullable(),
  previsao: z.coerce.date().optional().nullable(),
  cnae: z.string().optional().nullable(),
  codMunicipioIbge: z.string().optional().nullable(),
  ibge: z.string().optional().nullable(),
  correspEndereco: z.string().optional().nullable(),
  correspBairro: z.string().optional().nullable(),
  correspCidade: z.string().optional().nullable(),
  correspUf: z.string().optional().nullable(),
  correspCep: z.string().optional().nullable(),
  correspComplemento: z.string().optional().nullable(),
  correspNumero: z.string().optional().nullable(),
  foto: z.string().optional().nullable(),
  tipoCadastro: z.string().optional().nullable(),
  ie: z.string().optional().nullable(),
  mdia: z.string().optional().nullable(),
  tDocumento: z.string().optional().nullable(),
  tVencimento: z.string().optional().nullable(),
  tCobranca: z.string().optional().nullable(),
  retencoes: z.string().optional().nullable(),
  simples: z.string().optional().nullable(),
  correios: z.string().optional().nullable(),
  email1: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  email2: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  email3: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  email4: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  email5: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
  contribuinte: z.string().optional().nullable(),
  vlrMens: z.coerce.number().optional().nullable(),
  observacao: z.string().optional().nullable(),
  usaFor: z.string().optional().nullable(),
  crt: z.string().optional().nullable(),
  melhorDia: z.string().optional().nullable(),
  vendedor: z.string().optional().nullable(),
  travado: z.boolean().optional(),
  ativo: z.boolean().optional(),
  inadimplente: z.boolean().optional(),
  especial: z.boolean().optional(),
  bloqueado: z.boolean().optional(),
  pessoa: z.string().optional().nullable(),
  teste: z.string().optional().nullable(),
  documentosPdf: z.string().optional().nullable(),
  codigoAnterior: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.pessoa === "J") {
    const cleanedCnpj = data.cpf?.replace(/\D/g, '');
    if (!cleanedCnpj || !isValidCnpj(cleanedCnpj)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CNPJ inválido",
        path: ["cpf"],
      });
    }
  } else if (data.pessoa === "F") {
    const cleanedCpf = data.cpf?.replace(/\D/g, '');
    if (!cleanedCpf || !isValidCpf(cleanedCpf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CPF inválido",
        path: ["cpf"],
      });
    }
  }
});

export type upsertClientSchema = z.infer<typeof upsertClientSchema>;
