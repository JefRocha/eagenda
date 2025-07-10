// app/(protected)/users/[userId]/edit/page.tsx
import { useRouter } from "next/navigation";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

interface PageProps { params: { userId: string } }

export default async function EditUserPage({ params }: PageProps) {
  const session = await auth.api.getSession();
  if (!session?.user) return null;

  const user = await db.select().from(usersTable).where(usersTable.id.eq(params.userId)).then(r=>r[0]);
  if (!user) return <div>Usuário não encontrado</div>;

  return (
    <div>
      <h1>Editar: {user.name}</h1>
      {/* Formulário de edição aqui */}
      <p>Email: {user.email}</p>
      <Link href={`/protected/${params.userId}/permissions`}>Gerenciar Permissões</Link>
    </div>
  );
}
