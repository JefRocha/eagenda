"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff,Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertUser } from "@/actions/users/upsert-user";
import { upsertUserSchema } from "@/actions/users/upsert-user/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  FormDescription,
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
import { PermissionsList } from "@/modules/permissions/permissions-list";

interface UpsertUserFormProps {
  initialData?: User;
  isOpen: boolean;
  onClose: () => void;
  availablePermissions: { id: string; name: string }[];
}

export const UpsertUserForm = ({
  initialData,
  isOpen,
  onClose,
  availablePermissions = [],

}: UpsertUserFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errorAlertDialog, setErrorAlertDialog] = useState({
    isOpen: false,
    message: "",
  });
  const queryClient = useQueryClient();
  const form = useForm<upsertUserSchema>({
    resolver: zodResolver(upsertUserSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          password: "",
          confirmPassword: "",
          permissions: [],
        }
      : {
          name: "",
          email: "",
          role: "USER",
          password: "",
          confirmPassword: "",
          permissions: [],
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
      console.log(error); // Adicionado para depuração
      setErrorAlertDialog({
        isOpen: true,
        message: error.message || error.serverError || "Ocorreu um erro inesperado.",
      });
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        id: initialData.id,
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        password: "",
        confirmPassword: "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "USER",
        password: "",
        confirmPassword: "",
      });
    }
  }, [initialData, form]);

  const onSubmit = (values: upsertUserSchema) => {
    execute(values);
  };

  return (
    <>
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input autoComplete="off-new-name" placeholder="Nome do usuário" {...field} />
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
                      <Input autoComplete="off-email-custom"
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
              <FormField
                control={form.control}
                name="permissions"
                render={() => (
                  <FormItem>
                    <FormLabel>Permissões</FormLabel>
                    <div className="grid grid-cols-2 gap-2">
                      {availablePermissions?.map((permission) => (
                        <label key={permission.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            value={permission.id}
                            checked={form.getValues("permissions")?.includes(permission.id)}
                            onChange={(e) => {
                              const current = form.getValues("permissions") || [];
                              if (e.target.checked) {
                                form.setValue("permissions", [...current, permission.id]);
                              } else {
                                form.setValue(
                                  "permissions",
                                  current.filter((p) => p !== permission.id),
                                );
                              }
                            }}
                          />
                          {permission.name}
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!initialData && (
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Senha do usuário"
                              {...field}
                              type={showPassword ? "text" : "password"}
                            />
                            <span
                              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage className="h-[20px]" />
                        <FormDescription>
                          A senha deve ter pelo menos 6 caracteres.
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Confirme a senha"
                              {...field}
                              type={showPassword ? "text" : "password"}
                            />
                            <span
                              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage className="h-[20px]" />
                      </FormItem>
                    )}
                  />
                  
                </div>
              )}
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

      <AlertDialog
        open={errorAlertDialog.isOpen}
        onOpenChange={() =>
          setErrorAlertDialog({ ...errorAlertDialog, isOpen: false })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Erro</AlertDialogTitle>
            <AlertDialogDescription>
              {errorAlertDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() =>
                setErrorAlertDialog({ ...errorAlertDialog, isOpen: false })
              }
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};