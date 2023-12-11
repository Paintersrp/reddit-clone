import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    // Get request body json and then parse it with validator
    const body = await req.json();
    const { name } = UsernameValidator.parse(body);

    // Retrieve session, if exists
    const session = await getAuthSession();

    // If no user, give an unauthorized response
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Checks is the validated username already exists
    const username = await db.user.findFirst({
      where: {
        username: name,
      },
    });

    // Returns response if username is taken
    if (username) {
      return new Response("Username is taken", { status: 409 });
    }

    // Update the username with validated data
    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: name,
      },
    });

    return new Response("OK");
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general error
    return new Response("Could not update username, please try again later.", {
      status: 500,
    });
  }
}
