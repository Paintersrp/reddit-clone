import { z } from "zod";

import { ThreadVoteValidator } from "@/lib/validators/vote";
import { getAuthSession } from "@/lib/auth";
import { tallyVoteScoreAndCache } from "@/lib/votes";
import { db } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    // Get and validate request body
    const body = await req.json();
    const { threadId, voteType } = ThreadVoteValidator.parse(body);

    // Get session, if it exists
    const session = await getAuthSession();

    // If no user, return unauthorized response
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

        // Finds current thread in db for scoring
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

        // Checks new vote count and caches in Redis if necessary
        const voteAmt = await tallyVoteScoreAndCache(thread!, voteType);

        // Update thread vote score
        await db.thread.update({
          where: {
            id: thread!.id,
          },
          data: {
            score: voteAmt,
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

      // Checks new vote count and caches in Redis if necessary
      const voteAmt = await tallyVoteScoreAndCache(thread!, voteType);

      // Update thread vote score
      await db.thread.update({
        where: {
          id: thread!.id,
        },
        data: {
          score: voteAmt,
        },
      });

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

    // Finds current thread in db for scoring
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

    // Checks new vote count and caches in Redis if necessary
    const voteAmt = await tallyVoteScoreAndCache(thread!, voteType);

    // Update thread vote score
    await db.thread.update({
      where: {
        id: thread!.id,
      },
      data: {
        score: voteAmt,
      },
    });

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
