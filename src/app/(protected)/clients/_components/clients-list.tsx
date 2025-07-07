"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { searchClients } from "@/actions/upsert-client";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import { SearchInput } from "./search-input";
import { clientsTableColumns } from "./table-columns";

export const ClientsList = () => {
  const searchParams = useSearchParams();

  const search = searchParams.get("search");
  const page = Number(searchParams.get("page")) || 1;
  const order = searchParams.get("order");
  const orderBy = searchParams.get("orderBy");

  const { data, isLoading } = useQuery({
    queryKey: ["clients", search, page, order, orderBy],
    queryFn: () =>
      searchClients({
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
        columns={clientsTableColumns}
        data={data?.data || []}
        pagination={data?.pagination}
      />
    </>
  );
};
