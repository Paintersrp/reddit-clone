import { z } from "zod";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  try {
    // Parse query parameters
    const { limit, page, sort } = z
      .object({
        limit: z.string(),
        page: z.string(),
        sort: z.string(),
      })
      .parse({
        limit: searchParams.get("limit") ?? 10,
        page: searchParams.get("page") ?? 1,
        sort: searchParams.get("sort"),
      });

    // Number of threads to return
    const take = parseInt(limit);

    // Number of threads to skip before beginning to take
    const skip = (parseInt(page) - 1) * take;

    // Setup order by based on sort parameter
    const sortMap: { [key: string]: { [key: string]: string } } = {
      newest: {
        createdAt: "desc",
      },
      oldest: {
        createdAt: "asc",
      },
      top: {
        score: "desc",
      },
      worst: {
        score: "asc",
      },
    };

    const orderBy = sortMap[sort];

    const totalThreadsCount = await db.thread.count();

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

    const hasMore = parseInt(page) * parseInt(limit) < totalThreadsCount;

    return new Response(JSON.stringify({ threads, hasMore }));
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general error
    return new Response("Could not fetch threads", { status: 500 });
  }
}
