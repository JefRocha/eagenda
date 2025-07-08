import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { cnpj: string } }) {
  const { cnpj } = await params;

  if (!cnpj) {
    return NextResponse.json({ error: "CNPJ é obrigatório" }, { status: 400 });
  }

  try {
    const cleanedCnpj = cnpj.replace(/\D/g, '').padStart(14, '0');
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanedCnpj}`);
    console.log("API Route - ReceitaWS Response Status:", response.status);

    // Verifica se a resposta é OK e se é JSON
    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      const errorText = await response.text();
      console.error("API Route - ReceitaWS Non-JSON/Error Response:", errorText);
      return NextResponse.json({ success: false, error: `Erro na API da ReceitaWS: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log("API Route - ReceitaWS Response Data:", data);

    if (response.status === 200 && data.status !== "ERROR") {
      return NextResponse.json({ success: true, data });
    } else {
      return NextResponse.json({ success: false, error: data.message || "Erro ao buscar CNPJ." }, { status: response.status });
    }
  } catch (error: any) {
    console.error("Erro ao buscar CNPJ na rota de API:", error);
    return NextResponse.json({ success: false, error: error.message || "Erro interno do servidor." }, { status: 500 });
  }
}