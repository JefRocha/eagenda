"use server";

import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { accountsTable, usersTable, usersToClinicsTable } from "@/db/schema";
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
    if (!clinicId) throw new Error("Clinic não encontrada");

    if (data.password !== data.confirmPassword) {
      throw new Error("As senhas não coincidem.");
    }
    if (!data.id && !data.password) {
      throw new Error("Senha obrigatória para novos usuários.");
    }

    let userToUpsert = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, data.email),
    });

    if (!userToUpsert) {
      // === NOVO USUÁRIO ===
      try {
        const res = await auth.api.signUpEmail({
          body: {
            email: data.email,
            password: data.password!,
            name: data.name,
          },
          headers: await headers(),
          autoSignIn: false,
        });

        if (!res.user) {
          console.error("Auth API sem usuário:", res);
          throw new Error("Falha ao criar usuário via autenticação.");
        }

        userToUpsert = res.user;

        if (data.role && data.role !== userToUpsert.role) {
          await db.update(usersTable)
            .set({ role: data.role, updatedAt: new Date() })
            .where(eq(usersTable.id, userToUpsert.id));
        }
      } catch (err) {
        console.error("Erro auth.api.signUpEmail:", err);
        throw new Error("Erro ao criar conta. Veja logs do servidor.");
      }
    } else {
      // === USUÁRIO EXISTENTE ===
      await db.update(usersTable)
        .set({
          name: data.name,
          email: data.email,
          role: data.role,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userToUpsert.id));

      if (data.password) {
        const hash = await bcrypt.hash(data.password, 10);
        const account = await db.query.accountsTable.findFirst({
          where: and(
            eq(accountsTable.userId, userToUpsert.id),
            eq(accountsTable.providerId, "credentials"),
          ),
        });

        if (account) {
          await db.update(accountsTable)
            .set({ password: hash, updatedAt: new Date() })
            .where(eq(accountsTable.id, account.id));
        } else {
          await db.insert(accountsTable).values({
            id: crypto.randomUUID(),
            userId: userToUpsert.id,
            providerId: "credentials",
            accountId: data.email,
            password: hash,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    // === RELAÇÃO COM CLÍNICA ===
    const link = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.userId, userToUpsert.id),
        eq(usersToClinicsTable.clinicId, clinicId),
      ),
    });
    if (!link) {
      await db.insert(usersToClinicsTable).values({
        userId: userToUpsert.id,
        clinicId,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    revalidatePath("/users");
    return {
      message: `Usuário ${data.id ? "atualizado" : "criado"} com sucesso.`,
    };
  });
