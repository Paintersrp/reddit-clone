import { z } from "zod";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  try {
    // Parse query parameters
    const { limit, page, sortType, sortOrder } = z
      .object({
        limit: z.string(),
        page: z.string(),
        sortType: z.enum(["top", "date"]).optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      })
      .parse({
        limit: searchParams.get("limit") ?? 10,
        page: searchParams.get("page") ?? 1,
        sortType: searchParams.get("sortType") ?? "top",
        sortOrder: searchParams.get("sortOrder") ?? "desc",
      });

    // Number of threads to return
    const take = parseInt(limit);

    // Number of threads to skip before beginning to take
    const skip = (parseInt(page) - 1) * take;

    // Direction to sort the createdAt by
    let orderBy = {};

    if (sortType === "date") {
      orderBy = { createdAt: sortOrder };
    } else if (sortType === "top") {
      orderBy = {
        votes: {
          _count: sortOrder,
        },
      };
    }

    // Find threads based on query parameters
    const threads = await db.thread.findMany({
      take,
      skip,
      orderBy,
      include: {
        subhive: true,
        votes: true,
        author: true,
        comments: true,
        _count: true,
      },
    });

    return new Response(JSON.stringify(threads));
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general error
    return new Response("Could not fetch threads", { status: 500 });
  }
}
