import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubhiveValidator } from "@/lib/validators/subhive";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = SubhiveValidator.parse(body);

    const subhiveExists = await db.subhive.findFirst({ where: { name } });

    if (subhiveExists) {
      return new Response("Subhive already exists", { status: 409 });
    }

    const subhive = await db.subhive.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    await db.subscription.create({
      data: {
        userId: session.user.id,
        subhiveId: subhive.id,
      },
    });

    return new Response(subhive.name);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not create subhive", { status: 500 });
  }
}

// export async function GET(req: Request) {}
