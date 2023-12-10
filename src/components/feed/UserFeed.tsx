import type { Session } from "next-auth";

import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import { db } from "@/lib/db";
import ThreadFeed from "./ThreadFeed";

interface UserFeedProps {
  session: Session;
}

const UserFeed = async ({ session }: UserFeedProps) => {
  let whereClause = {};

  // Retrieve the user's followed communities
  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subhive: true,
    },
  });

  // If the user has followed communities, we filter the threads to those communities. We none, we provide leave an empty where clause for a general feed.
  if (followedCommunities.length > 0) {
    whereClause = {
      subhive: {
        name: {
          in: followedCommunities.map(({ subhive }) => subhive.id),
        },
      },
    };
  }

  const threads = await db.thread.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      votes: true,
      author: true,
      comments: true,
      subhive: true,
      _count: true,
    },
    take: INFINITE_SCROLLING_PER_PAGE,
  });

  return <ThreadFeed initialThreads={threads} />;
};

export default UserFeed;
