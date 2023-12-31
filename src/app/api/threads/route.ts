import { z } from "zod";

import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  // Get search parameters from url
  const { searchParams } = new URL(req.url);

  // Mutatable array to hold a user's followed communities, if user exists
  let followedCommunitiesIds: string[] = [];

  // Get session, if it exists
  const session = await getAuthSession();

  // If we have a user session, get their followed community ids
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
    const { limit, page, subhiveName, sort } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subhiveName: z.string().nullish().optional(),
        sort: z.string(),
      })
      .parse({
        limit: searchParams.get("limit"),
        page: searchParams.get("page"),
        subhiveName: searchParams.get("subhiveName"),
        sort: searchParams.get("sort"),
      });

    if (subhiveName) {
      // If we have a subhive name, we use it to filter in the where clause
      whereClause = {
        subhive: {
          name: subhiveName,
        },
      };
    } else if (session) {
      // If we have no subhive name but have a user, we filter to their communities
      // We also verify that the user has followed communities, and if not we leave an empty where clause
      if (followedCommunitiesIds.length > 0) {
        whereClause = {
          subhive: {
            id: {
              in: followedCommunitiesIds,
            },
          },
        };
      }
    }

    // Count the total threads available based on the whereClause
    const totalThreadsCount = await db.thread.count({
      where: whereClause,
    });

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

    // Use limit, page, and any where conditions to query the db for threads
    const threads = await db.thread.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy,
      include: {
        subhive: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    const hasMore = parseInt(page) * parseInt(limit) < totalThreadsCount;

    // Return threads
    return new Response(JSON.stringify({ threads, hasMore }));
  } catch (error) {
    // Handle validation error
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    // Handle general error
    return new Response("Could not fetch more threads", { status: 500 });
  }
}
