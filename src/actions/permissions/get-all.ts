"use server";

import { db } from "@/db";
import { permissionsTable } from "@/db/schema";

export async function getAllPermissions() {
  return db.query.permissionsTable.findMany();
}
