"use client";

import axios from "axios";
import { Loader2 } from "lucide-react";
import { useIntersection } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FC, useEffect, useRef, useState } from "react";

import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import { ExtendedThread } from "@/types/db";
import ExtendedFeed from "./ExtendedFeed";
import FeedItem from "./FeedItem";
import { FeedSortToolbar, type SortOptions } from "./FeedSortToolbar";

interface ThreadFeedProps {
  initialThreads: ExtendedThread[];
  subhiveName?: string;
  all?: boolean;
}

const ThreadFeed: FC<ThreadFeedProps> = ({
  initialThreads,
  subhiveName,
  all,
}) => {
  // Retrieve current user session, if exists
  const { data: session } = useSession();

  // Boolean state to flag the end of the original feed and need for an extended feed
  const [showExtendedFeed, setShowExtendedFeed] = useState(false);

  // String state to hold the sortation option selected, default to newest
  const [sortOption, setSortOption] = useState<SortOptions>("newest");

  // Creating reference for our original feed
  const lastPostRef = useRef<HTMLElement>(null);

  // Creating intersection observer for our ref, to be used to trigger the infinite scroll
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  // Fetches more threads from endpoint, determined by incoming all prop
  const fetchThreads = async ({ pageParam = 1 }) => {
    let base: string = "";

    // Setup base endpoint to use
    if (all) {
      base = "/api/threads/all?";
    } else {
      base = "/api/threads?";
    }

    // Setup limit, page, subhive, and sort query search parameter
    const limit = `limit=${INFINITE_SCROLLING_PER_PAGE}`;
    const page = `&page=${pageParam}`;
    const subhive = !!subhiveName ? `&subhiveName=${subhiveName}` : "";
    const sort = `&sort=${sortOption}`;

    // Combine and GET query
    const query = `${base}${limit}${page}${subhive}${sort}`;
    const { data } = await axios.get(query);

    // If we have no more data to retrieve, and we aren't already processing all we initiate another feed
    // If we are already using the all endpoint, then the user has exhausted all available threads in the db if there are no more.
    if (!data.hasMore) {
      if (!all) {
        if (!subhiveName) {
          setShowExtendedFeed(true);
        }
      }
    }

    return data.threads as ExtendedThread[];
  };

  const { data, fetchNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(["inf-query", sortOption, subhiveName], fetchThreads, {
      getNextPageParam: (_, pages) => {
        // If we can show the extended feed, then this feed has been exhausted.
        // No need to paginate further
        if (showExtendedFeed) {
          return undefined;
        }

        return pages.length + 1;
      },
      initialData: { pages: [initialThreads], pageParams: [1] },
    });

  // Effect to check the intersection observer to trigger fetching the next page
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  // Flat maps and lengths of feed
  const threads = data?.pages.flatMap((page) => page) ?? initialThreads;
  const length = threads.length;

  return (
    <>
      {/* Sort Toolbar */}
      <FeedSortToolbar
        currentOption={sortOption}
        setSortOption={setSortOption}
      />

      {/* Display of threads in our feed */}
      <ul className="flex flex-col col-span-2 sm:space-y-6 sm:mt-0 mb-6">
        {threads.map((thread, index) => {
          return (
            <FeedItem
              key={thread.id}
              thread={thread}
              length={length}
              index={index}
              userId={session?.user.id}
              ref={ref}
            />
          );
        })}

        {/* Loading indicator when fetching more threads */}
        {isFetchingNextPage && (
          <div className="flex justify-center mt-2">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        )}

        {/* Loading indicator when starting a query for threads */}
        {isFetching && !isFetchingNextPage && (
          <div className="flex justify-center mt-2">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        )}
      </ul>

      {/* Once our original feed has been exhausted, we render an extended feed */}
      {showExtendedFeed && (
        <ExtendedFeed
          originalFeedThreads={threads}
          showExtendedFeed={showExtendedFeed}
        />
      )}
    </>
  );
};

export default ThreadFeed;
