import { createSafeActionClient } from "next-safe-action";

export const action = createSafeActionClient({
  handleReturnedServerError: (e) => {
    console.log("Erro recebido no handleReturnedServerError:", e); // Adicionado para depuração
    // Retorna a mensagem do erro se for uma instância de Error
    if (e instanceof Error) {
      return e.message;
    }
    // Se for uma string, retorna a string diretamente
    if (typeof e === 'string') {
      return e;
    }
    // Fallback para outros tipos de erro
    return "Ocorreu um erro inesperado.";
  },
});

