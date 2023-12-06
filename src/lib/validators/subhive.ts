import { z } from "zod";

export const SubhiveValidator = z.object({
  name: z.string().min(3).max(21),
});

export type CreateSubhivePayload = z.infer<typeof SubhiveValidator>;
