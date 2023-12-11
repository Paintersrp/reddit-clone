import { z } from "zod";

import { SubhiveSubscriptionValidator } from "@/lib/validators/subscribe";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Get and validate request body
    const body = await req.json();
    const { subhiveId } = SubhiveSubscriptionValidator.parse(body);

    // Get session, if it exists
    const session = await getAuthSession();

    // If no user, return unauthorized response
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Query database for the user's current subscription status
    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subhiveId,
        userId: session.user.id,
      },
    });

    // Handle cases where the user is not subscribed
    if (!subscriptionExists) {
      return new Response("You are not subscribed to this subhive", {
        status: 400,
      });
    }

    // Verify user is not the creator of the subhive
    const subhive = await db.subhive.findFirst({
      where: {
        id: subhiveId,
        creatorId: session.user.id,
      },
    });

    // Return response in instances that the user is the creator of the subhive
    if (subhive) {
      return new Response("You cannot unsubscribe from your own subhive", {
        status: 400,
      });
    }

    // Delete subscription
    await db.subscription.delete({
      where: {
        userId_subhiveId: {
          subhiveId,
          userId: session.user.id,
        },
      },
    });

    return new Response(subhiveId);
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general error
    return new Response(
      "Could not unsubscribe to the subhive, please try again later.",
      { status: 500 }
    );
  }
}
