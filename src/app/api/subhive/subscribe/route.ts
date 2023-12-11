import { z } from "zod";

import { SubhiveSubscriptionValidator } from "@/lib/validators/subscribe";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    // Get request body json and then parse it with validator
    const body = await req.json();
    const { subhiveId } = SubhiveSubscriptionValidator.parse(body);

    // Retrieve session, if exists
    const session = await getAuthSession();

    // If no user, give an unauthorized response
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

    // Handle cases where the user is already subscribed
    if (subscriptionExists) {
      return new Response("You are already subscribed to this subhive", {
        status: 400,
      });
    }

    // Create subscription as one does not exist
    await db.subscription.create({
      data: {
        subhiveId,
        userId: session.user.id,
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
      "Could not subscribe to the subhive, please try again later.",
      { status: 500 }
    );
  }
}
