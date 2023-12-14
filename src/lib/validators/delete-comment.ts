import { z } from "zod";

export const DeleteCommentValidator = z.object({
  commentId: z.string(),
});

export type DeleteCommentRequest = z.infer<typeof DeleteCommentValidator>;
