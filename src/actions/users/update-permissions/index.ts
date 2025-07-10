"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { createSafeAction } from "@/lib/next-safe-action";

import { updatePermissionsSchema } from "./schema";

export const updatePermissions = createSafeAction({
  scheme: updatePermissionsSchema,
  handler: async (data) => {
    const session = await auth.api.getSession();
    const loggedInUserClinicId = session?.user.clinic?.id;

    if (!loggedInUserClinicId || session.user.role !== "MASTER") {
      throw new Error("Unauthorized");
    }

    await db
      .update(usersToClinicsTable)
      .set({ permissions: data.permissions })
      .where(
        and(
          eq(usersToClinicsTable.userId, data.userId),
          eq(usersToClinicsTable.clinicId, loggedInUserClinicId),
        ),
      );

    revalidatePath(`/users/${data.userId}/permissions`);
    revalidatePath("/users");

    return { message: "Permissões atualizadas com sucesso!" };
  },
});
