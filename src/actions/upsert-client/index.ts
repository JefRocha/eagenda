"use server";

import { and, asc, count, desc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { cache } from "react";

import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { action } from "@/lib/next-safe-action";

import { upsertClientSchema } from "./schema";

export const upsertClient = action
  .schema(upsertClientSchema)
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
          .insert(clientsTable)
          .values({
            ...parsedInput,
            id: parsedInput.id,
            clinicId: session?.user.clinic?.id,
          })
          .onConflictDoUpdate({
            target: [clientsTable.id],
            set: {
              ...parsedInput,
            },
          });
    revalidatePath("/clients");
    console.log("upsertClient action completed successfully");
  });

export const getClinicClients = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  return await db.query.clientsTable.findMany({
    where: eq(clientsTable.clinicId, session.user.clinic.id),
    orderBy: desc(clientsTable.createdAt),
  });
});

export const getClientById = cache(async (clientId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!session?.user.clinic?.id) {
    throw new Error("Clinic not found");
  }

  const client = await db.query.clientsTable.findFirst({
    where: and(
      eq(clientsTable.id, clientId),
      eq(clientsTable.clinicId, session.user.clinic.id),
    ),
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return client;
});

export const searchClients = cache(
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

    const { search = "", page = 1, limit = 10, orderBy, order } = params;

    const conditions = [eq(clientsTable.clinicId, session.user.clinic.id)];

    if (search) {
      conditions.push(ilike(clientsTable.fantasia, `%${search}%`));
    }

    const clients = await db.query.clientsTable.findMany({
      where: and(...conditions),
      limit,
      offset: (page - 1) * limit,
      orderBy: orderBy
        ? order === "asc"
          ? asc(clientsTable[orderBy])
          : desc(clientsTable[orderBy])
        : desc(clientsTable.createdAt),
    });

    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(clientsTable)
      .where(and(...conditions));

    return {
      data: clients,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  },
);
