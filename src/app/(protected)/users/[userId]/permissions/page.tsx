import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUserPermissions } from "@/actions/users/get-user-permissions";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { PermissionsList } from "@/modules/permissions/list";

import { PermissionsForm } from "./_components/permissions-form";

interface UserPermissionsPageProps {
  params: {
    userId: string;
  };
}

const UserPermissionsPage = async ({ params }: UserPermissionsPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "MASTER") {
    redirect("/authentication");
  }

  const { permissions: initialPermissions } = await getUserPermissions(
    params.userId,
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Gerenciar Permissões</PageTitle>
          <PageDescription>Atribua permissões para o usuário.</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Permissões Atuais:</h2>
          <PermissionsList permissions={initialPermissions} />
        </div>
        <PermissionsForm
          userId={params.userId}
          initialPermissions={initialPermissions}
        />
      </PageContent>
    </PageContainer>
  );
};

export default UserPermissionsPage;