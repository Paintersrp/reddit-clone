import { z } from "zod";

export const ThreadValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be longer than 3 characters" })
    .max(128, { message: "Title cannot be more than 128 characters." }),
  subhiveId: z.string(),
  content: z.any(),
});

export type ThreadCreationRequest = z.infer<typeof ThreadValidator>;
