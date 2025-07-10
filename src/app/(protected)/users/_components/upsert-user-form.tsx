"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertUser } from "@/actions/users/upsert-user";
import { upsertUserSchema } from "@/actions/users/upsert-user/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { User } from "@/db/schema";
import { useAction } from "@/hooks/use-action";

interface UpsertUserFormProps {
  initialData?: User;
  isOpen: boolean;
  onClose: () => void;
}

export const UpsertUserForm = ({
  initialData,
  isOpen,
  onClose,
}: UpsertUserFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<upsertUserSchema>({
    resolver: zodResolver(upsertUserSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
        }
      : {
          name: "",
          email: "",
          role: "USER",
        },
  });

  const { execute, isLoading } = useAction(upsertUser, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(initialData ? "Usuário atualizado" : "Usuário criado");
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error(error.serverError || "Ocorreu um erro inesperado.");
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "USER",
      });
    }
  }, [initialData, form]);

  const onSubmit = (values: upsertUserSchema) => {
    execute(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Usuário" : "Novo Usuário"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos para adicionar ou editar um usuário.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do usuário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E-mail do usuário"
                      {...field}
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">Usuário Comum</SelectItem>
                      <SelectItem value="MASTER">Master</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : initialData ? (
                  "Salvar Alterações"
                ) : (
                  "Adicionar Usuário"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
