// lib/actions/patients.ts (expandir o arquivo existente)
"use server";

import { and, count, desc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { cache } from "react";

import { db } from "@/db";
import { patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertPatientSchema } from "./schema";

// ✅ Manter sua implementação existente
export const upsertPatient = actionClient
  .schema(upsertPatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    await db
      .insert(patientsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
        data_nascimento: parsedInput.dataNascimento
          ? new Date(parsedInput.dataNascimento)
          : undefined,
      })
      .onConflictDoUpdate({
        target: [patientsTable.id],
        set: {
          ...parsedInput,
          data_nascimento: parsedInput.dataNascimento
            ? new Date(parsedInput.dataNascimento)
            : undefined,
        },
      });
    revalidatePath("/patients");
  });

// ✅ Adicionar funções de consulta (sem next-safe-action)
export const getClinicPatients = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  return await db.query.patientsTable.findMany({
    where: eq(patientsTable.clinicId, session.user.clinic.id),
    orderBy: desc(patientsTable.createdAt),
  });
});

// ✅ Função para buscar paciente específico
export const getPatientById = cache(async (patientId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const patient = await db.query.patientsTable.findFirst({
    where: and(
      eq(patientsTable.id, patientId),
      eq(patientsTable.clinicId, session.user.clinic.id),
    ),
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  return patient;
});

// ✅ Função para busca com filtros (para futuras funcionalidades)
export const searchPatients = cache(
  async (
    params: {
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    const { search = "", page = 1, limit = 50 } = params;

    const conditions = [eq(patientsTable.clinicId, session.user.clinic.id)];

    if (search) {
      conditions.push(ilike(patientsTable.name, `%${search}%`));
    }

    const patients = await db.query.patientsTable.findMany({
      where: and(...conditions),
      limit,
      offset: (page - 1) * limit,
      orderBy: desc(patientsTable.createdAt),
    });

    // Contar total para paginação
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(patientsTable)
      .where(and(...conditions));

    return {
      data: patients,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },
);

// ✅ Action para deletar paciente (usando next-safe-action)
import { z } from "zod";

const deletePatientSchema = z.object({
  id: z.string().min(1),
});

export const deletePatient = actionClient
  .schema(deletePatientSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    // Verificar se o paciente pertence à clínica
    const patient = await db.query.patientsTable.findFirst({
      where: and(
        eq(patientsTable.id, parsedInput.id),
        eq(patientsTable.clinicId, session.user.clinic.id),
      ),
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    await db.delete(patientsTable).where(eq(patientsTable.id, parsedInput.id));

    revalidatePath("/patients");
  });
