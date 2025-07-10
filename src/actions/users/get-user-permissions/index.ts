"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getUserPermissions = async (userId: string) => {
  const session = await auth.api.getSession();
  const loggedInUserClinicId = session?.user.clinic?.id;

  if (!loggedInUserClinicId) {
    throw new Error("Clinic not found for the current user");
  }

  const userClinicLink = await db.query.usersToClinicsTable.findFirst({
    where: and(
      eq(usersToClinicsTable.userId, userId),
      eq(usersToClinicsTable.clinicId, loggedInUserClinicId),
    ),
  });

  return {
    permissions: userClinicLink?.permissions || [],
  };
};
