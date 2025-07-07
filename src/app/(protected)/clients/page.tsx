import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

import AddClientButton from "./_components/add-client-button";
import { ClientsList } from "./_components/clients-list";

const ClientsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Clientes</PageTitle>
          <PageDescription>
            Gerencie os clientes da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddClientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <ClientsList />
      </PageContent>
    </PageContainer>
  );
};

export default ClientsPage;
