"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { searchUsers } from "@/actions/users/search-users";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import { usersTableColumns } from "./table-columns";
import { UpsertUserForm } from "./upsert-user-form";

interface UsersListProps {
  availablePermissions: { id: string; name: string }[];
}

export const UsersList = ({ availablePermissions }: UsersListProps) => {
  const searchParams = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const search = searchParams.get("search");
  const page = Number(searchParams.get("page")) || 1;
  const order = searchParams.get("order");
  const orderBy = searchParams.get("orderBy");
  
  const { data, isLoading } = useQuery({
    queryKey: ["users", search, page, order, orderBy],
    queryFn: () =>
      searchUsers({
        search: search || undefined,
        page,
        order: order || undefined,
        orderBy: orderBy || undefined,
      }),
  });

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!availablePermissions) {
  return <Skeleton className="h-96 w-full" />;
}

  return (
    <>
      <div className="mb-4 flex w-full items-center justify-end">
        <Button onClick={() => setIsFormOpen(true)}>Adicionar Usuário</Button>
      </div>
      <DataTable
        columns={usersTableColumns}
        data={data?.data || []}
        pagination={data?.pagination}
      />
      <UpsertUserForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} availablePermissions={availablePermissions} />
    </>
  );
};