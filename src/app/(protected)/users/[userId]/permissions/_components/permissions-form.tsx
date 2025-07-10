"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updatePermissions } from "@/actions/users/update-permissions";
import {
  UpdatePermissionsSchema,
  updatePermissionsSchema,
} from "@/actions/users/update-permissions/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { systemPermissions } from "@/lib/permissions";

interface PermissionsFormProps {
  userId: string;
  initialPermissions: string[];
}

export function PermissionsForm({
  userId,
  initialPermissions,
}: PermissionsFormProps) {
  const form = useForm<UpdatePermissionsSchema>({
    resolver: zodResolver(updatePermissionsSchema),
    defaultValues: {
      userId,
      permissions: initialPermissions,
    },
  });

  const { execute, status } = useAction(updatePermissions, {
    onSuccess: (data) => {
      if (data?.message) {
        toast.success(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.serverError || "Erro ao atualizar permissões.");
    },
  });

  const onSubmit = (values: UpdatePermissionsSchema) => {
    execute(values);
  };

  const isLoading = status === "executing";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {systemPermissions.map((permission) => (
          <FormField
            key={permission.id}
            control={form.control}
            name="permissions"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {permission.name}
                    </FormLabel>
                    <FormDescription>
                      {permission.description}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value?.includes(permission.id)}
                      onCheckedChange={(checked) => {
                        const newPermissions = checked
                          ? [...(field.value || []), permission.id]
                          : (field.value || []).filter(
                              (value) => value !== permission.id,
                            );
                        field.onChange(newPermissions);
                      }}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
        ))}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </Form>
  );
}