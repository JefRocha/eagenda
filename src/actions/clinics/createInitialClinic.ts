'use server';

import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const createInitialClinic = async () => {
  const session = await auth.api.getSession();
  const user = session?.user;

  if (!user || user.role !== "MASTER") {
    return { error: "Usuário não autorizado para criar clínica." };
  }

  const clinic = await db.insert(clinicsTable).values({
    name: user.name || "Clínica do Usuário",
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  await db.insert(usersToClinicsTable).values({
    userId: user.id,
    clinicId: clinic[0].id,
    permissions: [], // você pode ajustar permissões padrão aqui
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/dashboard");

  return { success: true };
};
