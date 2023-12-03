import { z } from "zod";

import { SubhiveSubscriptionValidator } from "@/lib/validators/subhive";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subhiveId } = SubhiveSubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subhiveId,
        userId: session.user.id,
      },
    });

    if (subscriptionExists) {
      return new Response("You are already subscribed to this subhive", {
        status: 400,
      });
    }

    await db.subscription.create({
      data: {
        subhiveId,
        userId: session.user.id,
      },
    });

    return new Response(subhiveId);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not subscribe to the subhive, please try again later.",
      { status: 500 }
    );
  }
}
