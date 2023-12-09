import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { ExtendedThreads } from "@/types/db";
import { CachedThread } from "@/types/redis";
import { formatTimeToNow } from "@/lib/utils";

import VoteServer from "@/components/vote/VoteServer";
import VoteSkeleton from "@/components/vote/VoteSkeleton";
import EditorOutput from "@/components/editor/EditorOutput";
import Comments from "@/components/comments/Comments";
import DeleteThreadDialog from "@/components/threads/DeleteThreadDialog";

interface PageProps {
  params: {
    threadId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const Page = async ({ params }: PageProps) => {
  const { threadId } = params;
  const session = await getAuthSession();

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
    <div className="h-full flex flex-col sm:flex-row items-center sm:items-start justify-between">
      {/* Thread Header */}
      <div className="sm:w-0 w-full flex-1 bg-white p-4 md:rounded-sm">
        {thread?.authorId === session?.user.id && (
          <div className="flex justify-end mb-1">
            <DeleteThreadDialog threadId={thread?.id ?? cachedThread.id} />
          </div>
        )}

        {cachedThread?.authorId === session?.user.id && (
          <div className="flex justify-end mb-1">
            <DeleteThreadDialog threadId={thread?.id ?? cachedThread.id} />
          </div>
        )}

        <div className="flex flex-row w-full">
          <div className="flex w-full">
            {/* Suspense shows skeleton of votes, avoiding waiting on cache miss */}
            <Suspense fallback={<VoteSkeleton />}>
              {/* @ts-expect-error Server Component */}
              <VoteServer
                threadId={thread?.id ?? cachedThread.id}
                getData={getVoteData}
              />
            </Suspense>

            <div>
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
            </div>
          </div>
        </div>

        {/* Thread Content */}
        <EditorOutput content={thread?.content ?? cachedThread.content} />

        {/* Thread Comments */}
        <Suspense
          fallback={<Loader2 className="h-5 w-5 animate-spin text-zinc-500" />}
        >
          {/* @ts-expect-error Server Component */}
          <Comments threadId={thread?.id ?? cachedThread.id} />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
