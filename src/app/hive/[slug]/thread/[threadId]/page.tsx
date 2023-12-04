import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";

import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { ExtendedThreads } from "@/types/db";
import { CachedThread } from "@/types/redis";
import { buttonVariants } from "@/components/ui/Button";
import VoteServer from "@/components/vote/VoteServer";
import { formatTimeToNow } from "@/lib/utils";
import EditorOutput from "@/components/EditorOutput";

interface PageProps {
  params: {
    threadId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const Page = async ({ params }: PageProps) => {
  const { threadId } = params;

  const cachedThread = (await redis.hgetall(
    `thread:${threadId}`
  )) as CachedThread;

  let thread: Partial<ExtendedThreads> | null = null;

  if (!cachedThread) {
    thread = await db.thread.findFirst({
      where: {
        id: threadId,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }

  if (!thread && !cachedThread) return notFound();

  const getVoteData = async () => {
    return await db.thread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        votes: true,
      },
    });
  };

  return (
    <div>
      <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
        {/* Suspense shows skeleton of votes, avoiding waiting on cache miss */}
        <Suspense fallback={<VoteSkeleton />}>
          {/* @ts-expect-error Server Component */}
          <VoteServer
            threadId={thread?.id ?? cachedThread.id}
            getData={getVoteData}
          />
        </Suspense>

        {/* Thread Header */}
        <div className="sm:w-0 w-full flex-1 bg-white p-4 rounded-sm">
          <p className="max-h-40 mt-1 truncate text-sm text-gray-500">
            Created by u/
            {thread?.author?.username ?? cachedThread.authorUsername} {"  "}
            {formatTimeToNow(
              new Date(thread?.createdAt ?? cachedThread.createdAt)
            )}
          </p>
          <h1 className="text-xl font-semibold py-2 leading-6 text-gray-900">
            {thread?.title ?? cachedThread.title}
          </h1>

          {/* Thread Content */}
          <EditorOutput content={thread?.content ?? cachedThread.content} />
        </div>
      </div>
    </div>
  );
};

const VoteSkeleton = () => {
  return (
    <div className="flex items-center flex-col pr-6 w-20">
      {/* Upvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="h-5 w-5 text-zinc-700" />
      </div>

      {/* Score */}
      <div className="text-center py-2 font-medium text-sm text-zinc-900">
        <Loader2 className="h-3 w-3 animate-spin" />
      </div>

      {/* Downvote */}
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="h-5 w-5 text-zinc-700" />
      </div>
    </div>
  );
};

export default Page;
