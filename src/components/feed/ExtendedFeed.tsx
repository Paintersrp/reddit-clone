"use client";

import type { ExtendedThread } from "@/types/db";

import axios from "axios";
import { useIntersection } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FC, useEffect, useRef, useState } from "react";

import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import FeedItem from "./FeedItem";
import { FeedSortToolbar, SortOptions } from "./FeedSortToolbar";
import Loading from "../layout/Loading";

interface ExtendedFeedProps {
  originalFeedThreads: ExtendedThread[];
  showExtendedFeed: boolean;
}

const ExtendedFeed: FC<ExtendedFeedProps> = ({
  originalFeedThreads,
  showExtendedFeed,
}) => {
  const { data: session } = useSession();

  // Boolean for whether or not the feed has been exhausted or not
  const [fetchedAll, setFetchedAll] = useState(false);

  // Creating ref for the last post of our feed
  const lastPostRef = useRef<HTMLElement>(null);

  // String state to hold the sortation option selected, default to newest
  const [sortOption, setSortOption] = useState<SortOptions>("newest");

  // Creating intersection observers for our ref, to be used to trigger the infinite scroll
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  // Fetches more threads from the all endpoint
  const fetchAllThreads = async ({ pageParam = 1 }) => {
    const base = "/api/threads/all?";
    const limit = `limit=${INFINITE_SCROLLING_PER_PAGE}`;
    const page = `&page=${pageParam}`;
    const sort = `&sort=${sortOption}`;

    // Build query from base endpoint with limit number and page number search parameters.
    const query = `${base}${limit}${page}${sort}`;
    const { data } = await axios.get(query);

    // If we have no more data, we set fetchedAll to true.
    if (!data.hasMore) {
      setFetchedAll(true);
    }

    return data.threads as ExtendedThread[];
  };

  const { data, fetchNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(["inf-query-more", sortOption], fetchAllThreads, {
      getNextPageParam: (_, pages) => {
        // If we have already fetchedAll the available threads, we do not paginate further
        if (fetchedAll) {
          return undefined;
        }

        return pages.length + 1;
      },
      initialData: { pages: [], pageParams: [1] },
      enabled: showExtendedFeed,
    });

  // Effect to check the intersection observer to trigger fetching the next page
  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  // Set of IDs used in the original feed, to avoid rendering duplicate threads in the feeds
  const originalFeedIds = new Set(
    originalFeedThreads.map((thread) => thread.id)
  );

  const threads = data?.pages.flatMap((page) => page) ?? [];

  // Filter 'threads' to exclude threads already in the original feed
  const uniqueThreads = threads.filter(
    (thread) => !originalFeedIds.has(thread.id)
  );

  const length = uniqueThreads.length;

  return (
    <>
      {/* Display to denote end of original feed and beginning of extended feed */}
      <div className="my-6">
        <p className="text-center text-zinc-600 text-sm mb-2">
          Personalized feed has been exhausted
        </p>
        <hr className="border-t border-zinc-300" />
        <p className="text-center text-zinc-600 text-sm mt-2">
          Continuing feed with threads from hive/all
        </p>
      </div>

      {/* Sort Toolbar */}
      <FeedSortToolbar
        currentOption={sortOption}
        setSortOption={setSortOption}
      />

      {/* Display of unique threads in the extended feed */}
      <ul className="flex flex-col col-span-2 sm:space-y-6 sm:mt-0 mb-6">
        {uniqueThreads.map((thread, index) => {
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
        {isFetchingNextPage && <Loading />}

        {/* Loading indicator when starting a query for threads */}
        {isFetching && !isFetchingNextPage && <Loading />}
      </ul>
    </>
  );
};

export default ExtendedFeed;
