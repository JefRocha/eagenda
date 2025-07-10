import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";

import { UserPermissionDTO } from "../dto/user-permissions.dto";

export class UserPermissionsService {
  // armazena permissões no DB
  static async setPermissions(input: UserPermissionDTO) {
    const { userId, clinicId, permissions } = input;
    await db
      .update(usersToClinicsTable)
      .set({ permissions })
      .where(
        usersToClinicsTable.userId.equals(userId),
        usersToClinicsTable.clinicId.equals(clinicId)
      );
    return { success: true };
  }

  // busca permissões atuais
  static async getPermissions(userId: string, clinicId: string) {
    const row = await db
      .select()
      .from(usersToClinicsTable)
      .where(
        usersToClinicsTable.userId.equals(userId),
        usersToClinicsTable.clinicId.equals(clinicId)
      )
      .limit(1)
      .then((r) => r[0]);
    return {
      userId,
      clinicId,
      permissions: row?.permissions || [],
    };
  }
}
