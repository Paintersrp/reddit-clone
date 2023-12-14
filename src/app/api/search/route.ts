import { db } from "@/lib/db";

export async function GET(req: Request) {
  // Extract search parameters from url and check for query
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  // Handle requests with no search query
  if (!query) return new Response("Invalid query", { status: 400 });

  // Search for threads containing the query
  const threadResults = await db.thread.findMany({
    where: {
      title: {
        contains: query,
      },
    },
    include: {
      _count: true,
      subhive: true,
    },
    take: 10,
  });

  // Search for subhives containing the query
  const hiveResults = await db.subhive.findMany({
    where: {
      name: {
        contains: query,
      },
    },
    include: {
      _count: true,
    },
    take: 10,
  });

  // Search for users containing the query
  const userResults = await db.user.findMany({
    where: {
      username: {
        contains: query,
      },
    },
    include: {
      _count: true,
    },
    take: 10,
  });

  // Combined search results
  const results = {
    threads: threadResults,
    hives: hiveResults,
    users: userResults,
  };

  // Return response of search results
  return new Response(JSON.stringify(results));
}
