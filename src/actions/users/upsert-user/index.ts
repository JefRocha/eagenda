"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // Importar bcryptjs

import { db } from "@/db";
import { usersTable, usersToClinicsTable, accountsTable } from "@/db/schema"; // Add accountsTable
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

    // Validação de senhas na Server Action
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      throw new Error("As senhas não coincidem.");
    }
    if (!data.id && !data.password) {
      throw new Error("A senha é obrigatória para novos usuários.");
    }
    if (!data.id && !data.confirmPassword) {
      throw new Error("A confirmação da senha é obrigatória para novos usuários.");
    }
    if (data.id && (data.password || data.confirmPassword)) {
      if (!data.password) {
        throw new Error("A senha é obrigatória para atualizar.");
      }
      if (!data.confirmPassword) {
        throw new Error("A confirmação da senha é obrigatória para atualizar.");
      }
    }


    let userToUpsert = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, data.email),
    });

    if (!userToUpsert) {
      // Create new user
      const newUser = await db
        .insert(usersTable)
        .values({
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          emailVerified: false,
          role: data.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      userToUpsert = newUser[0];

      // If password is provided, create an account entry
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await db.insert(accountsTable).values({
          id: crypto.randomUUID(), // Generate a new ID for the account
          userId: userToUpsert.id,
          providerId: "credentials", // Or a suitable provider name
          accountId: userToUpsert.email, // Or a unique identifier for the account
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else {
      // Update existing user
      await db
        .update(usersTable)
        .set({
          name: data.name,
          email: data.email,
          role: data.role,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userToUpsert.id));

      // If password is provided, update the account entry
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await db
          .update(accountsTable)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(and(eq(accountsTable.userId, userToUpsert.id), eq(accountsTable.providerId, "credentials"))); // Assuming "credentials" provider
      }
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
