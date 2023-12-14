import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import { db } from "@/lib/db";
import ThreadFeed from "./ThreadFeed";

const AllFeed = async () => {
  const threads = await db.thread.findMany({
    take: INFINITE_SCROLLING_PER_PAGE,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      subhive: true,
      votes: true,
      author: true,
      comments: true,
      _count: true,
    },
  });

  return <ThreadFeed initialThreads={threads} all={true} />;
};

export default AllFeed;
