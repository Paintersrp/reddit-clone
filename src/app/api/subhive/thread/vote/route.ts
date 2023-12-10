import { z } from "zod";

import { ThreadVoteValidator } from "@/lib/validators/vote";
import { getAuthSession } from "@/lib/auth";
import { tallyVoteScoreAndCache } from "@/lib/votes";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const { threadId, voteType } = ThreadVoteValidator.parse(body);

    // Get session, if it exists
    const session = await getAuthSession();

    // If no user, return 401 Unauthorized
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if vote already exists
    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        threadId,
      },
    });

    // Fetch current thread for caching with joins
    const thread = await db.thread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        author: true,
        votes: true,
        _count: true,
      },
    });

    // Handles any case of no threads, if somehow occured
    if (!thread) {
      return new Response("Thread not found", { status: 404 });
    }

    if (existingVote) {
      // If the user's current vote is the same as the incoming request voteType, we delete it
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_threadId: {
              threadId,
              userId: session.user.id,
            },
          },
        });

        return new Response("OK");
      }

      // If the vote isn't the same as the previous vote status, we update the user's vote for this thread to the new voteType
      await db.vote.update({
        where: {
          userId_threadId: {
            threadId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      // Checks new vote count and caches in Redis if necessary
      tallyVoteScoreAndCache(thread, voteType);

      return new Response("OK");
    }

    // No existing vote, create one
    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        threadId,
      },
    });

    // Checks new vote count and caches in Redis if necessary
    tallyVoteScoreAndCache(thread, voteType);

    return new Response("OK");
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response("Invalid POST request data passed", { status: 422 });
    }

    // Handle generic error
    return new Response("Could not register your vote, please try again.", {
      status: 500,
    });
  }
}
