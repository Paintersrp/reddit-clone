"use client";

import type { Thread, User, Vote } from "@prisma/client";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { FC, useRef } from "react";

import EditorOutput from "@/components/editor/EditorOutput";
import VoteClient from "@/components/vote/client/VoteClient";
import VoteClientDisplayHorizontal from "@/components/vote/client/VoteClientDisplayHorizontal";
import { formatTimeToNow } from "@/lib/utils";

type PartialVote = Pick<Vote, "type">;

interface ThreadProps {
  subhiveName: string;
  thread: Thread & {
    author: User;
    votes: Vote[];
  };
  commentAmt: number;
  votesAmt: number;
  currentVote?: PartialVote;
}

const Thread: FC<ThreadProps> = ({
  subhiveName,
  thread,
  commentAmt,
  votesAmt,
  currentVote,
}) => {
  // Sets up a ref for our thread, so we can monitor the height for the transparent gradient
  const threadRef = useRef<HTMLDivElement>(null);

  return (
    <div className="sm:rounded-md bg-white sm:shadow sm:border-0 border-b border-zinc-200">
      <div className="px-3 py-2 sm:px-6 sm:py-4 flex justify-between">
        <div className="w-0 flex-1">
          {/* Thread tertiary details (author, dates) */}
          <div className="flex flex-row justify-between mt-1 text-xs text-gray-500">
            <div>
              {subhiveName ? (
                <>
                  <a
                    className="underline text-zinc-900 text-sm underline-offset-2"
                    href={`/hive/${subhiveName}`}
                  >
                    hive/{subhiveName}
                  </a>
                  <span className="px-1">•</span>
                </>
              ) : null}
              <span>
                Posted by{" "}
                <Link
                  href={`/user/${thread.author.username}`}
                  className="text-blue-700 hover:underline"
                >
                  u/{thread.author.username}
                </Link>
              </span>
              <span className="px-1">•</span>
              <span>{formatTimeToNow(new Date(thread.createdAt))}</span>
            </div>
          </div>

          {/* Title display */}
          <a href={`/hive/${subhiveName}/thread/${thread.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {thread.title}
            </h1>
          </a>

          {/* Content display */}
          <a href={`/hive/${subhiveName}/thread/${thread.id}`}>
            <div
              className="relative text-sm max-h-36 w-full overflow-clip flex flex-col gap-4"
              ref={threadRef}
            >
              <EditorOutput content={thread.content} />
              {threadRef.current?.clientHeight === 144 ? (
                <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
              ) : null}
            </div>
          </a>
        </div>
      </div>

      {/* Thread toolbar with votes and comments display */}
      <div className="z-20 text-sm sm:p-4 sm:px-6 flex">
        <VoteClient
          threadId={thread.id}
          initialVote={currentVote?.type}
          initialVotesAmt={votesAmt}
        >
          <VoteClientDisplayHorizontal />
        </VoteClient>

        <a
          className="w-fit flex items-center gap-2 text-black !rounded-full !bg-zinc-50 !border border-zinc-100 m-2 !p-2"
          href={`/hive/${subhiveName}/thread/${thread.id}`}
        >
          <MessageSquare className="w-4 h-4 text-black" /> {commentAmt}{" "}
          <span className="hidden sm:block text-black ">comments</span>
        </a>
      </div>
    </div>
  );
};

export default Thread;
