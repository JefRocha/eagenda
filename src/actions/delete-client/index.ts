"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { action } from "@/lib/next-safe-action";

export const deleteClient = action
  .schema(
    z.object({
      id: z.number().int().positive(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    const patient = await db.query.clientsTable.findFirst({
      where: eq(clientsTable.id, parsedInput.id),
    });
    if (!patient) {
      throw new Error("Paciente não encontrado");
    }
    if (patient.clinicId !== session.user.clinic?.id) {
      throw new Error("Paciente não encontrado");
    }
    await db.delete(clientsTable).where(eq(clientsTable.id, parsedInput.id));
    revalidatePath("/patients");
  });
