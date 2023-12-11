import { z } from "zod";

import { CommentVoteValidator } from "@/lib/validators/vote";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { tallyVoteScore } from "@/lib/tally";

export async function PATCH(req: Request) {
  try {
    // Get and validate request body
    const body = await req.json();
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    // Get session, if it exists
    const session = await getAuthSession();

    // If no user, return unauthorized response
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if vote already exists
    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    if (existingVote) {
      // If the user's current vote is the same as the incoming request voteType, we delete it
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });

        const comment = await db.comment.findFirst({
          where: { id: commentId },
          include: { votes: true },
        });

        const voteAmt = await tallyVoteScore(comment);

        await db.comment.update({
          where: {
            id: commentId,
          },
          data: {
            score: voteAmt,
          },
        });

        return new Response("OK");
      }

      // If the vote isn't the same as the previous vote status, we update the user's vote for this thread to the new voteType
      await db.commentVote.update({
        where: {
          userId_commentId: {
            commentId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      const comment = await db.comment.findFirst({
        where: { id: commentId },
        include: { votes: true },
      });

      const voteAmt = await tallyVoteScore(comment);

      await db.comment.update({
        where: {
          id: commentId,
        },
        data: {
          score: voteAmt,
        },
      });

      return new Response("OK");
    }

    // No existing vote, create one
    await db.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId,
      },
    });

    const comment = await db.comment.findFirst({
      where: { id: commentId },
      include: { votes: true },
    });
    
    const voteAmt = await tallyVoteScore(comment);

    await db.comment.update({
      where: {
        id: commentId,
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
