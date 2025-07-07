import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { searchExams } from "@/actions/upsert-exam";
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

import AddExamButton from "./_components/add-exam-button";
import { SearchInput } from "./_components/search-input";
import { examsTableColumns } from "./_components/table-columns";

interface ExamsPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

const ExamsPage = async ({ searchParams }: ExamsPageProps) => {
  const params = new URLSearchParams(searchParams.toString());
  const search = params.get("search");
  const page = params.get("page");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  if (!session.user.clinic) {
    redirect("/clinic-form");
  }

  const { data, pagination } = await searchExams({
    search: search || undefined,
    page: Number(page) || 1,
    limit: 10,
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Exames</PageTitle>
          <PageDescription>
            Gerencie os exames da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddExamButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <SearchInput />
        <DataTable
          data={data}
          columns={examsTableColumns}
          pagination={pagination}
        />
      </PageContent>
    </PageContainer>
  );
};

export default ExamsPage;
