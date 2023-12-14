import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeleteCommentValidator } from "@/lib/validators/delete-comment";

export async function PATCH(req: Request) {
  try {
    // Get and validate request body
    const body = await req.json();
    const { commentId } = DeleteCommentValidator.parse(body);

    // Get session, if it exists
    const session = await getAuthSession();

    // If no user, return unauthorized response
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Delete comment
    await db.comment.update({
      where: {
        id: commentId,
      },
      data: {
        text: "User has deleted comment.",
        authorId: session.user.id,
      },
    });

    return new Response("OK");
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general errors
    return new Response("Could not delete comment. Please try later", {
      status: 500,
    });
  }
}
