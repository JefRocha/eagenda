export interface UserPermissionDTO {
  userId: string;
  clinicId: string;
  permissions: string[]; // ex: ["CAN_EDIT_CLIENTS", "CAN_VIEW_DASHBOARD"]
}
