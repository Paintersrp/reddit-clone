import type { Session } from "next-auth";

import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import { db } from "@/lib/db";
import ThreadFeed from "./ThreadFeed";

interface UserFeedProps {
  session: Session;
}

const UserFeed = async ({ session }: UserFeedProps) => {
  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subhive: true,
    },
  });

  const threads = await db.thread.findMany({
    where: {
      subhive: {
        name: {
          in: followedCommunities.map(({ subhive }) => subhive.id),
        },
      },
    },
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

export default UserFeed;
