import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAllPermissions } from "@/actions/permissions/get-all";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import { UsersList } from "./_components/users-list";

const UsersPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const permissions = await getAllPermissions();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Usuários</PageTitle>
          <PageDescription>Gerencie os usuários da sua clínica</PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <UsersList availablePermissions={permissions}/>
      </PageContent>
    </PageContainer>
  );
};

export default UsersPage;