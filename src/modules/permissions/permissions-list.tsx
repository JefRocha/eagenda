"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface PermissionsListProps {
  selectedIds: string[];
  onChange: (permissionId: string, checked: boolean) => void;
  permissions: Permission[];
}

export const PermissionsList = ({
  selectedIds,
  onChange,
  permissions,
}: PermissionsListProps) => {
  return (
    <div className="space-y-4">
      {permissions.map((permission) => (
        <div key={permission.id} className="flex items-start space-x-2">
          <Checkbox
            id={permission.id}
            checked={selectedIds.includes(permission.id)}
            onCheckedChange={(checked) =>
              onChange(permission.id, Boolean(checked))
            }
          />
          <div className="space-y-1">
            <label
              htmlFor={permission.id}
              className="text-sm font-medium leading-none"
            >
              {permission.name}
            </label>
            {permission.description && (
              <p className="text-sm text-muted-foreground">
                {permission.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
