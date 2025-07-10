"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/db/schema";

import { UpsertUserForm } from "./upsert-user-form";

interface UsersTableActionsProps {
  user: User;
}

const UsersTableActions = ({ user }: UsersTableActionsProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/users/${user.id}/permissions`}>Editar Permissões</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpsertUserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        initialData={user}
      />
    </>
  );
};

export default UsersTableActions;