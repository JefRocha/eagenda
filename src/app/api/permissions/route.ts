import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { clinicsTable,db, usersToClinicsTable } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId faltando" }, { status: 400 });

  const availablePermissions = await db.query.clinicsTable.findMany();
  
  const userPerms = await db.select()
    .from(usersToClinicsTable)
    .where(eq(usersToClinicsTable.userId, userId))
    .then(rows => rows.map(r => r.clinicId));

  return NextResponse.json({ availablePermissions, userPermissions: userPerms });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, permissions } = body;
  if (!userId || !Array.isArray(permissions)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  await db.delete(usersToClinicsTable)
    .where(eq(usersToClinicsTable.userId, userId));

  await Promise.all(
    permissions.map(clinicId =>
      db.insert(usersToClinicsTable).values({ userId, clinicId })
    )
  );

  return NextResponse.json({ success: true });
}
