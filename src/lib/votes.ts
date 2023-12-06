import { Vote, VoteType } from "@prisma/client";

import { CACHE_AFTER_UPVOTES } from "@/config";
import { JoinedThread } from "@/types/db";
import { CachedThread } from "@/types/redis";
import { redis } from "./redis";

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

/*
 * Reduces the upvotes and downvotes to an accumulated score and checks if the thread
 * should be cached in Redis
 */
export const tallyVoteScoreAndCache = async (
  thread: JoinedThread,
  voteType: VoteType
) => {
  const votesAmt = tallyVoteScore(thread);

  if (votesAmt >= CACHE_AFTER_UPVOTES) {
    // If the votes amount is higher than our threshold, we cache a payload for the thread in redis
    const cachePayload: CachedThread = {
      authorUsername: thread.author.username ?? "",
      content: JSON.stringify(thread.content),
      id: thread.id,
      title: thread.title,
      currentVote: voteType,
      createdAt: thread.createdAt,
    };

    await redis.hset(`thread:${thread.id}`, cachePayload);
  }
};
