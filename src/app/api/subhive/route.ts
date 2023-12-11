import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubhiveValidator } from "@/lib/validators/subhive";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    // Get request body json and then parse it with validator
    const body = await req.json();
    const { name } = SubhiveValidator.parse(body);

    // Retrieve session, if exists
    const session = await getAuthSession();

    // If no user, give an unauthorized response
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Checks if the subhive name is already taken
    const subhiveExists = await db.subhive.findFirst({ where: { name } });

    // Return response if subhive already exists
    if (subhiveExists) {
      return new Response("Subhive already exists", { status: 409 });
    }

    // Create new subhive
    const subhive = await db.subhive.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    // Subscribe the user to their new subhive
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subhiveId: subhive.id,
      },
    });

    return new Response(subhive.name);
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    // Handle general error
    return new Response("Could not create subhive", { status: 500 });
  }
}

// export async function GET(req: Request) {}
