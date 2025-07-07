
"use client";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { searchExams } from "@/actions/upsert-exam";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import { SearchInput } from "./search-input";
import { examsTableColumns } from "./table-columns";

export const ExamsList = () => {
  const searchParams = useSearchParams();

  const search = searchParams.get("search");
  const page = Number(searchParams.get("page")) || 1;
  const order = searchParams.get("order");
  const orderBy = searchParams.get("orderBy");

  const { data, isLoading } = useQuery({
    queryKey: ["exams", search, page, order, orderBy],
    queryFn: () =>
      searchExams({
        search: search || undefined,
        page,
        order: order || undefined,
        orderBy: orderBy || undefined,
      }),
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <>
      <SearchInput />
      <DataTable
        columns={examsTableColumns}
        data={data?.data || []}
        pagination={data?.pagination}
      />
    </>
  );
};
