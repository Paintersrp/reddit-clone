import { CACHE_AFTER_UPVOTES } from "@/config";
import { CachedThread } from "@/types/redis";
import { Thread, User, Vote, VoteType } from "@prisma/client";
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_SECRET!,
});

type JoinedThread = Thread & {
  author: User;
  votes: Vote[];
};

export const reduceVotes = (thread: Omit<JoinedThread, "author">) => {
  return thread.votes.reduce((acc, vote) => {
    if (vote.type === "UP") return acc + 1;
    if (vote.type === "DOWN") return acc - 1;
    return acc;
  }, 0);
};

export const checkVotesAndCache = async (
  thread: JoinedThread,
  voteType: VoteType
) => {
  const votesAmt = reduceVotes(thread);

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
