import { z } from "zod";

import { ThreadValidator } from "@/lib/validators/thread";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Get and validate request body
    const body = await req.json();
    const { title, content, subhiveId } = ThreadValidator.parse(body);

    // Get session, if it exists
    const session = await getAuthSession();

    // If no user, return unauthorized response
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check user's subscription status to given subhive
    const subscription = await db.subscription.findFirst({
      where: {
        subhiveId,
        userId: session.user.id,
      },
    });

    // Handle cases of user not being subscribed to the subhive while attempting to post
    if (!subscription) {
      await db.subscription.create({
        data: {
          subhiveId,
          userId: session.user.id,
        },
      });
    }

    // Create thread with validated data
    await db.thread.create({
      data: {
        title,
        content,
        authorId: session.user.id,
        subhiveId,
      },
    });

    return new Response("OK");
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    // Handle general errors
    return new Response(
      "Could not post to subreddit at this time. Please try later",
      { status: 500 }
    );
  }
}
