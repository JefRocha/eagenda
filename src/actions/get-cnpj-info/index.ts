"use server";

import { z } from "zod";

import { action } from "@/lib/next-safe-action";

const schema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
});

async function getCnpjData({ parsedInput }: { parsedInput: { cnpj: string } }) {
  const { cnpj } = parsedInput;
  try {
    const cleanedCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/cnpj/${cleanedCnpj}`;
    console.log("Server Action - Calling internal API URL:", apiUrl);
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("Server Action - Internal API Response Data:", data);

    if (data.success) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.error || "Erro ao buscar CNPJ." };
    }
  } catch (error: any) {
    console.error("Erro ao buscar CNPJ na Server Action:", error);
    return { success: false, error: error.message || "Erro interno ao buscar CNPJ." };
  }
}

export const getCnpjInfo = action.schema(schema).action(getCnpjData);