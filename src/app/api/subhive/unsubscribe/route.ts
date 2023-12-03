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

    if (!subscriptionExists) {
      return new Response("You are not subscribed to this subhive", {
        status: 400,
      });
    }

    const subhive = await db.subhive.findFirst({
      where: {
        id: subhiveId,
        creatorId: session.user.id,
      },
    });

    if (subhive) {
      return new Response("You cannot unsubscribe from your own subhive", {
        status: 400,
      });
    }

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
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response(
      "Could not unsubscribe to the subhive, please try again later.",
      { status: 500 }
    );
  }
}
