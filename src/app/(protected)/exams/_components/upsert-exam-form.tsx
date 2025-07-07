"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

import { upsertExam } from "@/actions/upsert-exam";
import { upsertExamSchema } from "@/actions/upsert-exam/schema";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Exam } from "@/db/schema";
import { useAction } from "@/hooks/use-action";

interface UpsertExamFormProps {
  initialData?: Exam;
  isOpen: boolean;
  onSuccess: () => void;
}

const UpsertExamForm = ({ initialData, isOpen, onSuccess }: UpsertExamFormProps) => {
  const form = useForm<upsertExamSchema>({
    resolver: zodResolver(upsertExamSchema),
    defaultValues: initialData
      ?
      {
          ...initialData,
          validade: initialData.validade || 0,
          validade1: initialData.validade1 || 0,
          valor: initialData.valor || 0,
          codigoAnterior: initialData.codigo_anterior || "",
        }
      : {
          descricao: "",
          validade: 0,
          validade1: 0,
          valor: 0,
          pedido: "Não",
          tipo: "Admissional",
        },
  });

  const { execute, isLoading } = useAction(upsertExam, {
    onSuccess: () => {
      toast.success(initialData ? "Exame atualizado" : "Exame criado");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.serverError || "Ocorreu um erro inesperado.");
    },
  });

  const onSubmit = (values: upsertExamSchema) => {
    execute(values);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{initialData ? "Editar Exame" : "Novo Exame"}</DialogTitle>
        <DialogDescription>
          Preencha os campos para adicionar ou editar um exame.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do Exame" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Validade"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value === 0 ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validade1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validade 1</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Validade 1"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value === 0 ? "" : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <NumericFormat
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue);
                      }}
                      decimalScale={2}
                      fixedDecimalScale
                      decimalSeparator=","
                      allowNegative={false}
                      allowLeadingZeros={false}
                      thousandSeparator="."
                      customInput={Input}
                      prefix="R$"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pedido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pedido</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de pedido" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de exame" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admissional">Admissional</SelectItem>
                      <SelectItem value="Demissional">Demissional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigoAnterior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código Anterior</FormLabel>
                  <FormControl>
                    <Input placeholder="Código Anterior" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : initialData ? (
                "Salvar Alterações"
              ) : (
                "Criar Exame"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default UpsertExamForm;
