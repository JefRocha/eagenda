"use client";

import { z } from "zod";

export const deleteClientSchema = z.object({
  id: z.string(),
});
