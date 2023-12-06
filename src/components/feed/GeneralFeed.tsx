import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import { db } from "@/lib/db";
import ThreadFeed from "./ThreadFeed";

const GeneralFeed = async () => {
  const threads = await db.thread.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subhive: true,
    },
    take: INFINITE_SCROLLING_PER_PAGE,
  });

  return <ThreadFeed initialThreads={threads} />;
};

export default GeneralFeed;
