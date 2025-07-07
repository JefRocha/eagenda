"use client";

import { z } from "zod";

export const deleteExamSchema = z.object({
  id: z.string(),
});
