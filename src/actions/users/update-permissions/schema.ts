import { z } from "zod";

export const updatePermissionsSchema = z.object({
  userId: z.string(),
  permissions: z.array(z.string()),
});

export type UpdatePermissionsSchema = z.infer<typeof updatePermissionsSchema>;
