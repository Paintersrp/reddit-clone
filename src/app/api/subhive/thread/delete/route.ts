import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DeleteThreadValidator } from "@/lib/validators/delete-thread";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { threadId } = DeleteThreadValidator.parse(body);

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
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not create comment. Please try later", {
      status: 500,
    });
  }
}
