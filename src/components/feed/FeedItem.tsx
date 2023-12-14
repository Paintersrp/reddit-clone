"use client";

import type { ExtendedThread } from "@/types/db";

import { forwardRef } from "react";

import Thread from "./Thread";

interface FeedItemProps {
  thread: ExtendedThread;
  length: number;
  index: number;
  userId: string | undefined;
}

const FeedItem = forwardRef<HTMLLIElement, FeedItemProps>(
  ({ thread, length, index, userId }, ref) => {
    // Gets the current user's vote, if exists
    const userVote = thread.votes.find((vote) => vote.userId === userId);

    // If the index is the last, we add a ref to the thread display for triggering intersection observer
    if (index === length - 1) {
      return (
        <li key={thread.id} ref={ref}>
          <Thread
            commentAmt={thread.comments.length}
            subhiveName={thread.subhive.name}
            thread={thread}
            currentVote={userVote}
            votesAmt={thread.score}
          />
        </li>
      );
    } else {
      // Otherwise, we just render the thread
      return (
        <Thread
          key={thread.id}
          commentAmt={thread.comments.length}
          subhiveName={thread.subhive.name}
          thread={thread}
          currentVote={userVote}
          votesAmt={thread.score}
        />
      );
    }
  }
);

FeedItem.displayName = "FeedItem";

export default FeedItem;
