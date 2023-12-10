import { VoteType } from "@prisma/client";

import { CACHE_AFTER_UPVOTES } from "@/config";
import { JoinedThread } from "@/types/db";
import { CachedThread } from "@/types/redis";
import { redis } from "./redis";
import { tallyVoteScore } from "./tally";

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
      authorId: thread.authorId,
      content: JSON.stringify(thread.content),
      id: thread.id,
      title: thread.title,
      currentVote: voteType,
      createdAt: thread.createdAt,
      _count: thread._count,
    };

    await redis.hset(`thread:${thread.id}`, cachePayload);
  }
};
