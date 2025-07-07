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

import AddExamButton from "./_components/add-exam-button";
import { ExamsList } from "./_components/exams-list";

const ExamsPage = async () => {
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
        <ExamsList />
      </PageContent>
    </PageContainer>
  );
};

export default ExamsPage;
