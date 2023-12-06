import { z } from "zod";

export const ThreadVoteValidator = z.object({
  threadId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type ThreadVoteRequest = z.infer<typeof ThreadVoteValidator>;

export const CommentVoteValidator = z.object({
  commentId: z.string(),
  voteType: z.enum(["UP", "DOWN"]),
});

export type CommentVoteRequest = z.infer<typeof CommentVoteValidator>;
