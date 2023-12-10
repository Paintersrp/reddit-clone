import { z } from "zod";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    // Parse query parameters
    const { limit, page, sortField, sortOrder } = z
      .object({
        limit: z.string(),
        page: z.string(),
        sortField: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
      })
      .parse({
        limit: url.searchParams.get("limit") ?? 10,
        page: url.searchParams.get("page") ?? 1,
        sortField: url.searchParams.get("sortField") ?? "",
        sortOrder: url.searchParams.get("sortOrder") ?? "desc",
      });

    // Default sort
    const defaultSort = { createdAt: "desc" };
    let orderBy: any = defaultSort;

    // Custom sort
    if (sortField && sortOrder) {
      orderBy = { [sortField]: sortOrder };
    }

    // Fetch threads
    const threads = await db.thread.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
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
    // Error handling
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not fetch threads", { status: 500 });
  }
}
