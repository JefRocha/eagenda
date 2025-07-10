"use server";

import { and, asc, count, desc, eq, ilike, inArray,or } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface SearchUsersParams {
  search?: string;
  page?: number;
  order?: string;
  orderBy?: string;
}

export const searchUsers = async (params: SearchUsersParams) => {
  const session = await auth.api.getSession({ headers: await headers() });
  const loggedInUserId = session?.user.id;

  console.log("searchUsers: loggedInUserId", loggedInUserId);

  if (!loggedInUserId) {
    throw new Error("User not authenticated");
  }

  const page = params.page || 1;
  const pageSize = 10;
  const search = params.search;

  // Subquery to get the clinicId of the logged-in user
  const clinicIdSubquery = db
    .select({ value: usersToClinicsTable.clinicId })
    .from(usersToClinicsTable)
    .where(eq(usersToClinicsTable.userId, loggedInUserId))
    .limit(1);

  const clinicIdResult = await clinicIdSubquery;
  const clinicId = clinicIdResult[0]?.value;

  console.log("searchUsers: clinicId", clinicId);

  if (!clinicId) {
    console.log("searchUsers: No clinicId found, returning empty data.");
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      },
    };
  }

  // Subquery to get all user IDs from that clinic
  const userIdsInClinicSubquery = db
    .select({ userId: usersToClinicsTable.userId })
    .from(usersToClinicsTable)
    .where(eq(usersToClinicsTable.clinicId, clinicId));

  const where = and(
    inArray(usersTable.id, userIdsInClinicSubquery),
    search
      ? or(
          ilike(usersTable.name, `%${search}%`),
          ilike(usersTable.email, `%${search}%`),
        )
      : undefined,
  );

  const usersQuery = db
    .select()
    .from(usersTable)
    .where(where)
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .orderBy(
      params.orderBy && params.order
        ? params.order === "asc"
          ? // @ts-ignore
            asc(usersTable[params.orderBy])
          : // @ts-ignore
            desc(usersTable[params.orderBy])
        : // @ts-ignore
          desc(usersTable.createdAt),
    );

  const countQuery = db.select({ count: count() }).from(usersTable).where(where);

  const [data, [{ count: total }]] = await Promise.all([usersQuery, countQuery]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
