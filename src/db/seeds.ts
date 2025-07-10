import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/db";
import { accountsTable, usersTable } from "@/db/schema";

async function seed() {
  const userId = uuidv4(); // ✅ Gera um UUID válido

  await db.insert(usersTable).values({
    id: userId,
    name: "JEF - Super Admin",
    email: "jef_rocha@hotmail.com",
    emailVerified: true,
    plan: "premium",
    role: "SUPER_ADMIN", // ✅ sua enumeração
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(accountsTable).values({
    id: uuidv4(), // novo ID da conta
    accountId: userId, // ✅ deve ser o mesmo ID do usuário
    providerId: "credential", // ✅ login com senha
    userId: userId,
    password: await hash("Senha@123", 10),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seed concluído com sucesso.");
}

seed().catch((err) => {
  console.error("Erro ao rodar o seed:", err);
  process.exit(1);
});
