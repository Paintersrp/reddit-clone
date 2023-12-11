import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeleteThreadValidator } from "@/lib/validators/delete-thread";

export async function PATCH(req: Request) {
  try {
    // Get and validate request body
    const body = await req.json();
    const { threadId } = DeleteThreadValidator.parse(body);

    // Get session, if it exists
    const session = await getAuthSession();

    // If no user, return unauthorized response
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Delete thread
    await db.thread.update({
      where: {
        id: threadId,
      },
      data: {
        content: "User has removed their thread content.",
      },
    });

    return new Response("OK");
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general errors
    return new Response("Could not create comment. Please try later", {
      status: 500,
    });
  }
}
