import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Get session, if it exists
  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  // If we have a user session, get their followed communities
  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subhive: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map(
      ({ subhive }) => subhive.id
    );
  }

  try {
    // We start with no where clause, filled out conditionally
    let whereClause = {};

    // Validate and parse url search parameters
    const { limit, page, subhiveName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subhiveName: z.string().nullish().optional(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        subhiveName: url.searchParams.get("subhiveName"),
      });

    if (subhiveName) {
      // If we have a subhive name, we use it to filter
      whereClause = {
        subhive: {
          name: subhiveName,
        },
      };
    } else if (session) {
      // If we have no subhive name but have a user, we filter to their communities
      whereClause = {
        subhive: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    // Use limit, page, and any where conditions to query the db for threads
    const threads = await db.thread.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subhive: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(threads));
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general error
    return new Response("Could not fetch more threads", { status: 500 });
  }
}
