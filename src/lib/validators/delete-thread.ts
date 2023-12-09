import { z } from "zod";

export const DeleteThreadValidator = z.object({
  threadId: z.string(),
});

export type DeleteThreadRequest = z.infer<typeof DeleteThreadValidator>;
