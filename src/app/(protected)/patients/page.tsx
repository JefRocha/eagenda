// app/patients/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { searchPatients } from "@/actions/upsert-patient";
import { DataTable } from "@/components/ui/data-table";
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

import AddPatientButton from "./_components/add-patient-button";
import { SearchInput } from "./_components/search-input";
import { patientsTableColumns } from "./_components/table-columns";

interface PatientsPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

const PatientsPage = async ({ searchParams }: PatientsPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const { data, pagination } = await searchPatients({
    search: searchParams.search,
    page: Number(searchParams.page) || 1,
    limit: 10, // Defina o limite de itens por página
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>Cadastro de Colaboradores</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPatientButton userRole={session.user.role ?? "user"} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <SearchInput />
        <DataTable
          data={data}
          columns={patientsTableColumns}
          pagination={pagination}
        />
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPage;
