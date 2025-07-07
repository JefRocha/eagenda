"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { action } from "@/lib/next-safe-action";

import { deleteClientSchema } from "./schema";

export const deleteClient = action
  .schema(deleteClientSchema)
  .action(async ({ parsedInput: { id } }) => {
    try {
      const deletedClient = await db
        .delete(clientsTable)
        .where(eq(clientsTable.id, id))
        .returning();

      if (!deletedClient) {
        return {
          error: "Cliente não encontrado.",
        };
      }

      revalidatePath("/clients");

      return {
        success: "Cliente deletado com sucesso.",
      };
    } catch (error) {
      return {
        error: "Ocorreu um erro ao deletar o cliente.",
      };
    }
  });
