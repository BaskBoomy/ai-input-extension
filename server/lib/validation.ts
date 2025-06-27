import { z } from "zod";

export const suggestSchema = z.object({
  context: z.string().min(1),
  label: z.string().optional().default(""),
});

export const summarizeSchema = z.object({
  text: z.string().min(1),
});
