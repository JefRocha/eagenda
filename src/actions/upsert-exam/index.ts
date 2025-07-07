"use server";

import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { cache } from "react";

import { db } from "@/db";
import { examesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { upsertExamSchema } from "./schema";

export const upsertExam = actionClient
  .schema(upsertExamSchema)
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
      .insert(examesTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
      })
      .onConflictDoUpdate({
        target: [examesTable.id],
        set: {
          ...parsedInput,
        },
      });
    revalidatePath("/exams");
    console.log("upsertExam action completed successfully");
  });

export const getClinicExams = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  return await db.query.examesTable.findMany({
    where: eq(examesTable.clinicId, session.user.clinic.id),
    orderBy: desc(examesTable.createdAt),
  });
});

export const getExamById = cache(async (examId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const exam = await db.query.examesTable.findFirst({
    where: and(
      eq(examesTable.id, examId),
      eq(examesTable.clinicId, session.user.clinic.id),
    ),
  });

  if (!exam) {
    throw new Error("Exam not found");
  }

  return exam;
});

export const searchExams = cache(
  async (
    params: {
      search?: string;
      page?: number;
      limit?: number;
      orderBy?: string;
      order?: string;
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

    const { search = "", page = 1, limit = 50, orderBy, order } = params;

    const conditions = [eq(examesTable.clinicId, session.user.clinic.id)];

    if (search) {
      conditions.push(ilike(examesTable.descricao, `%${search}%`));
    }

    const exams = await db.query.examesTable.findMany({
      where: and(...conditions),
      limit,
      offset: (page - 1) * limit,
      orderBy: orderBy
        ? order === "asc"
          ? asc(examesTable[orderBy])
          : desc(examesTable[orderBy])
        : desc(examesTable.createdAt),
    });

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(examesTable)
      .where(and(...conditions));

    return {
      data: exams,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },
);


