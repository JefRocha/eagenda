// app/(protected)/[userId]/permissions/page.tsx
import { auth } from "@/lib/auth"; // ou seu helper para obter sessão

import PermissionForm from "./form";

interface PageProps {
  params: { userId: string };
}

export default async function PermissionsPage({ params: { userId } }: PageProps) {
  const session = await auth.api.getSession();
  if (!session?.user) return <div>Acesso negado.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Permissões do usuário {userId}</h1>
      <PermissionForm userId={userId} />
    </div>
  );
}
