// app/(protected)/users/page.tsx
import Link from "next/link";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function UsersPage() {
  const session = await auth.api.getSession();
  if (!session?.user) return null;

  const users = await db.select().from(usersTable);

  return (
    <div>
      <h1>Usuários</h1>
      <table>
        <thead><tr><th>Nome</th><th>Email</th><th>Permissões</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <Link href={`/protected/${u.id}/permissions`}>Edit Permissões</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
