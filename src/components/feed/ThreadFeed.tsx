"use client";

import axios from "axios";
import { FC, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersection } from "@mantine/hooks";

import { ExtendedThreads } from "@/types/db";
import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import Thread from "../threads/Thread";
import { Loader2 } from "lucide-react";

interface ThreadFeedProps {
  initialThreads: ExtendedThreads[];
  subhiveName?: string;
}

const ThreadFeed: FC<ThreadFeedProps> = ({ initialThreads, subhiveName }) => {
  const lastPostRef = useRef<HTMLElement>(null);

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data: session } = useSession();

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["inf-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/threads?limit=${INFINITE_SCROLLING_PER_PAGE}&page=${pageParam}` +
        (!!subhiveName ? `&subhiveName=${subhiveName}` : "");

      const { data } = await axios.get(query);

      return data as ExtendedThreads[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialThreads], pageParams: [1] },
    }
  );

  useEffect(() => {
    // Load more posts when the last post comes into view
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const threads = data?.pages.flatMap((page) => page) ?? initialThreads;

  return (
    <ul className="flex flex-col col-span-2 sm:space-y-6">
      {threads.map((thread, index) => {
        const votesAmt = thread.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;

          if (vote.type === "DOWN") return acc - 1;

          return acc;
        }, 0);

        const currentVote = thread.votes.find(
          (vote) => vote.userId === session?.user.id
        );

        if (index === threads.length - 1) {
          return (
            <li key={thread.id} ref={ref}>
              <Thread
                commentAmt={thread.comments.length}
                subhiveName={thread.subhive.name}
                thread={thread}
                currentVote={currentVote}
                votesAmt={votesAmt}
              />
            </li>
          );
        } else {
          return (
            <Thread
              key={thread.id}
              commentAmt={thread.comments.length}
              subhiveName={thread.subhive.name}
              thread={thread}
              currentVote={currentVote}
              votesAmt={votesAmt}
            />
          );
        }
      })}

      {isFetchingNextPage && (
        <li className="flex justify-center">
          <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
        </li>
      )}
    </ul>
  );
};

export default ThreadFeed;
