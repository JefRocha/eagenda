"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // Importar bcryptjs

import { db } from "@/db";
import { usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { action } from "@/lib/next-safe-action";

import { upsertUserSchema } from "./schema";

export const upsertUser = action
  .inputSchema(upsertUserSchema)
  .action(async ({ parsedInput: data }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    const loggedInUser = session?.user;

    if (!loggedInUser || loggedInUser.role !== "MASTER") {
      throw new Error("Unauthorized");
    }

    const clinicId = loggedInUser.clinic?.id;

    if (!clinicId) {
      throw new Error("Clinic not found for the current user");
    }

    let userToUpsert = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, data.email),
    });

    let hashedPassword = userToUpsert?.hashedPassword; // Manter a senha existente se não for fornecida uma nova

    if (data.password) {
      // Se uma nova senha for fornecida, gerar o hash
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    if (!userToUpsert) {
      const newUser = await db
        .insert(usersTable)
        .values({
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          emailVerified: false,
          role: data.role,
          hashedPassword: hashedPassword, // Adicionar a senha hasheada
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      userToUpsert = newUser[0];
    } else {
      // Atualizar usuário existente
      await db
        .update(usersTable)
        .set({
          name: data.name,
          email: data.email,
          role: data.role,
          hashedPassword: hashedPassword, // Atualizar a senha hasheada se uma nova foi fornecida
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userToUpsert.id));
    }

    if (!userToUpsert) {
      throw new Error("Failed to create or find user");
    }

    const existingLink = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, userToUpsert.id),
        eq(usersToClinicsTable.clinicId, clinicId),
      ),
    });

    if (existingLink) {
      await db
        .update(usersTable)
        .set({ role: data.role, updatedAt: new Date() })
        .where(eq(usersTable.id, userToUpsert.id));
    } else {
      await db.insert(usersToClinicsTable).values({
        userId: userToUpsert.id,
        clinicId,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db
        .update(usersTable)
        .set({ role: data.role, updatedAt: new Date() })
        .where(eq(usersTable.id, userToUpsert.id));
    }

    revalidatePath("/users");

    return { message: `User ${data.id ? "updated" : "created"} successfully` };
  });
