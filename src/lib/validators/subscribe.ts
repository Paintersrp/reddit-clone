import { z } from "zod";

export const SubhiveSubscriptionValidator = z.object({
  subhiveId: z.string(),
});

export type SubscribeToSubhivePayload = z.infer<
  typeof SubhiveSubscriptionValidator
>;
