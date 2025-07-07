"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { deleteClient } from "@/actions/delete-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet } from "@/components/ui/sheet";
import { Client } from "@/db/schema";
import { useAction } from "@/hooks/use-action";

import UpsertClientForm from "./upsert-client-form";

interface ClientsTableActionsProps {
  client: Client;
}

export const ClientsTableActions = ({ client }: ClientsTableActionsProps) => {
  const [upsertSheetIsOpen, setUpsertSheetIsOpen] = useState(false);

  const deleteClientAction = useAction(deleteClient, {
    onSuccess: () => {
      toast.success("Cliente excluído com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar cliente.");
    },
  });

  const handleDeleteClientClick = () => {
    if (!client) return;
    deleteClientAction.execute({ id: client.id });
  };

  return (
    <>
      <Sheet open={upsertSheetIsOpen} onOpenChange={setUpsertSheetIsOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{client.fantasia}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setUpsertSheetIsOpen(true)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer" onSelect={(e) => e.preventDefault()}>
                  <Trash className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Tem certeza que deseja excluir esse cliente?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser revertida. Isso irá deletar o cliente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClientClick}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <UpsertClientForm
          initialData={client}
          isOpen={upsertSheetIsOpen}
          onSuccess={() => setUpsertSheetIsOpen(false)}
        />
      </Sheet>
    </>
  );
};
