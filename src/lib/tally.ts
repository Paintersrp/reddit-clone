import { Vote } from "@prisma/client";

/*
 * Reduces the upvotes and downvotes to an accumulated score
 */
export const tallyVoteScore = (content: any) => {
  return content.votes.reduce((acc: number, vote: Vote) => {
    if (vote.type === "UP") return acc + 1;
    if (vote.type === "DOWN") return acc - 1;
    return acc;
  }, 0);
};
