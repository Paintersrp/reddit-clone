"use client";

import { FC, useRef } from "react";
import { Thread, User, Vote } from "@prisma/client";
import { MessageSquare } from "lucide-react";

import { formatTimeToNow } from "@/lib/utils";
import EditorOutput from "../editor/EditorOutput";
import VoteClient from "../vote/VoteClient";

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
  const threadRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        <VoteClient
          threadId={thread.id}
          initialVote={currentVote?.type}
          initialVotesAmt={votesAmt}
        />
        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
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
            <span>Posted by u/{thread.author.name}</span>
            {"  "}
            {formatTimeToNow(new Date(thread.createdAt))}
          </div>

          <a href={`/hive/${subhiveName}/thread/${thread.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {thread.title}
            </h1>
          </a>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={threadRef}
          >
            <EditorOutput content={thread.content} />
            {threadRef.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a
          className="w-fit flex items-center gap-2"
          href={`/hive/${subhiveName}/thread/${thread.id}`}
        >
          <MessageSquare className="w-4 h-4" /> {commentAmt} comments
        </a>
      </div>
    </div>
  );
};

export default Thread;
