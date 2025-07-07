"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Exam } from "@/db/schema";
import { formatCurrency } from "@/helpers/currency";
import { formatDate } from "@/helpers/time";

import { ExamsTableActions } from "./table-actions";

export const examsTableColumns: ColumnDef<Exam>[] = [
  {
    accessorKey: "descricao",
    header: "Descrição",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
  },
  {
    accessorKey: "validade",
    header: "Validade",
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => (
      <div className="flex items-center justify-between w-full">
        <span className="text-left w-0">R$</span>
        <span className="text-right">{formatCurrency(Number(row.original.valor))}</span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Criado Em",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: "actions",
    cell: ({ row }) => <ExamsTableActions exam={row.original} />,
  },
];
