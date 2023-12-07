import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q");

  if (!query) return new Response("Invalid query", { status: 400 });

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

  const results = {
    threads: threadResults,
    hives: hiveResults,
  };

  return new Response(JSON.stringify(results));
}
