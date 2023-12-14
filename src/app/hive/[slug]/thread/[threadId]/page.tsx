import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Loader2, MessageSquare } from "lucide-react";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { ExtendedThread } from "@/types/db";
import { CachedThread } from "@/types/redis";
import { formatTimeToNow } from "@/lib/utils";

import VoteServerWrapper from "@/components/vote/server/VoteServerWrapper";
import VoteSkeleton from "@/components/vote/VoteSkeleton";
import EditorOutput from "@/components/editor/EditorOutput";
import Comments from "@/components/comments/Comments";
import DeleteThreadDialog from "@/components/layout/DeleteThreadDialog";
import Link from "next/link";

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

  let thread: Partial<ExtendedThread> | null = null;

  if (!cachedThread) {
    thread = await db.thread.findFirst({
      where: {
        id: threadId,
      },
      include: {
        votes: true,
        author: true,
        _count: true,
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
          <div className="flex w-full pb-2">
            {/* Suspense shows skeleton of votes, avoiding waiting on cache miss */}
            <Suspense fallback={<VoteSkeleton />}>
              {/* @ts-expect-error Server Component */}
              <VoteServerWrapper
                threadId={thread?.id ?? cachedThread.id}
                getData={getVoteData}
              />
            </Suspense>

            <div>
              <p className="max-h-40 mt-1 truncate text-xs sm:text-sm text-gray-500">
                Created by u/
                <Link
                  href={`/user/${thread?.author?.username}`}
                  className="text-blue-700 hover:underline"
                >
                  {thread?.author?.username ?? cachedThread.authorUsername}
                </Link>
                {"  "}
                <span className="px-1">•</span>
                {formatTimeToNow(
                  new Date(thread?.createdAt ?? cachedThread.createdAt)
                )}
              </p>
              <h1 className="text-lg sm:text-xl font-semibold py-2 leading-6 text-gray-900">
                {thread?.title ?? cachedThread.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Thread Content */}
        <div className="flex flex-col gap-4 prose whitespace-pre-wrap pb-4">
          <EditorOutput content={thread?.content ?? cachedThread.content} />
        </div>

        <div className="w-fit flex items-center gap-2 text-black !rounded-full !bg-zinc-50 !border border-zinc-100 !p-2">
          <MessageSquare className="w-[14px] h-[14px] text-black" />
          <span className="text-xs font-medium">
            {thread?._count.comments} {"  "}
            comments
          </span>
        </div>

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
