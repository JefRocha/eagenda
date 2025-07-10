"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createSafeAction } from "@/lib/next-safe-action";

import { upsertUserSchema } from "./schema";

export const upsertUser = createSafeAction({
  scheme: upsertUserSchema,
  handler: async (data) => {
    const session = await auth.api.getSession();
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

    // If user does not exist, create a new one
    if (!userToUpsert) {
      const newUser = await db
        .insert(usersTable)
        .values({
          id: crypto.randomUUID(),
          name: data.name,
          email: data.email,
          emailVerified: false, // User will need to verify their email
          role: data.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      userToUpsert = newUser[0];
    }

    if (!userToUpsert) {
      throw new Error("Failed to create or find user");
    }

    // Check if the user is already associated with the clinic
    const existingLink = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, userToUpsert.id),
        eq(usersToClinicsTable.clinicId, clinicId),
      ),
    });

    if (existingLink) {
      // If link exists, update the user's role in the main users table
      await db
        .update(usersTable)
        .set({ role: data.role, updatedAt: new Date() })
        .where(eq(usersTable.id, userToUpsert.id));
    } else {
      // If no link exists, create one
      await db.insert(usersToClinicsTable).values({
        userId: userToUpsert.id,
        clinicId,
        permissions: [], // Default permissions
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // Also update the role in the users table
      await db
        .update(usersTable)
        .set({ role: data.role, updatedAt: new Date() })
        .where(eq(usersTable.id, userToUpsert.id));
    }

    revalidatePath("/users");

    return { message: `User ${data.id ? "updated" : "created"} successfully` };
  },
});
