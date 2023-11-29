import { z } from "zod";

export const SubhiveValidator = z.object({
  name: z.string().min(3).max(21),
});

export const SubhiveSubscriptionValidator = z.object({
  subhiveId: z.string(),
});

export type CreateSubhivePayload = z.infer<typeof SubhiveValidator>;

export type SubscribeToSubhivePayload = z.infer<
  typeof SubhiveSubscriptionValidator
>;
