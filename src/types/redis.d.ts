import { VoteType } from "@prisma/client";

export type CachedThread = {
  id: string;
  title: string;
  authorUsername: string;
  authorId: string;
  content: string;
  currentVote: VoteType | null;
  createdAt: Date;
};
