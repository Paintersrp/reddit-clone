import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

import {
  SideCard,
  SideCardContent,
  SideCardHeader,
} from "@/components/layout/SideCard";
import FeedItem from "@/components/feed/FeedItem";
import { db } from "@/lib/db";

import type { Metadata } from "next";
import Comment from "@/components/comments/Comment";
import CollapsibleComment from "@/components/comments/CollapsibleComment";
import { getAuthSession } from "@/lib/auth";

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = params;

  return {
    title: `Hivemind User - u/${username}`,
    description: `Profile page for ${username}`,
  };
}

const Page = async ({ params }: PageProps) => {
  const { username } = params;

  // Get current session, if it exists
  const session = await getAuthSession();

  // Query database for the user data
  const user = await db.user.findFirst({
    where: {
      username,
    },
    include: {
      _count: true,
      Subscription: {
        include: {
          subhive: {
            include: {
              _count: true,
            },
          },
        },
      },
      Comment: {
        include: {
          author: true,
          votes: true,
          replies: false,
        },
      },
      createdSubhives: true,
      Subhive: true,
      Thread: {
        include: {
          subhive: true,
          comments: true,
          votes: true,
          author: true,
          _count: true,
        },
      },
    },
  });

  if (!user) return notFound();

  const length = user.Thread.length;

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-[32px] w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-4 md:gap-x-4 sm:py-6 ">
        {/* Right Display */}
        <div className="order-first sm:order-last sm:space-y-4">
          <SideCard mobileHide={false}>
            <SideCardHeader>
              <h1 className="text-lg">Profile Information</h1>
            </SideCardHeader>
            <SideCardContent className="space-y-1">
              <p className="text-zinc-800">
                u/{user.username} ({user.name})
              </p>
              <p className="text-zinc-800">
                Biography Placeholder - Lorem ipsum dolor sit amet consectetur
                adipisicing elit. Corporis voluptates veniam ipsa. Vitae alias
                accusamus cumque eius, magni dolorem minus!
              </p>
            </SideCardContent>
          </SideCard>

          <SideCard mobileHide={false}>
            <SideCardHeader>
              <h1 className="text-lg">Activity Overview</h1>
            </SideCardHeader>
            <SideCardContent>
              <p className="text-zinc-800">Threads: {user._count.Thread}</p>
              <p className="text-zinc-800">Comments: {user._count.Comment}</p>
              <p className="text-zinc-800">
                Subscribed Communities: {user._count.Subscription}
              </p>
              <p className="text-zinc-800">
                Comment Votes: {user._count.CommentVote}
              </p>
              <p className="text-zinc-800">Thread Votes: {user._count.Vote}</p>
            </SideCardContent>
          </SideCard>

          <SideCard mobileHide={false}>
            <SideCardHeader>
              <h1 className="text-lg">Subscribed Communities</h1>
            </SideCardHeader>
            <SideCardContent>
              {user.Subscription.length > 0 ? (
                user.Subscription.map((sub) => (
                  <Link key={sub.subhive.id} href={`/hive/${sub.subhive.name}`}>
                    <div className="block hover:bg-gray-100 rounded-lg px-2 py-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-700">
                          hive/{sub.subhive.name}
                        </span>
                        <span className="text-xs font-medium bg-emerald-100 text-zinc-900 px-2 py-1 rounded-full">
                          {sub.subhive._count.threads} Threads
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <>No subscribed communities to display</>
              )}
            </SideCardContent>
          </SideCard>
        </div>

        {/* Left Display */}
        <div className="col-span-2 w-full">
          <div>
            <div className="flex items-center gap-2 mb-4 mt-4 p-1.5 sm:p-0">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user?.name ?? "user"}
                  width="40"
                  height="40"
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold leading-6 text-gray-900">
                  {user.username}&#39;s Threads ({user._count.Thread})
                </h2>
                <p className="text-sm text-gray-500">
                  Showing threads by {user.username}
                </p>
              </div>
            </div>
            {/* Display of user's threads */}
            <ul className="flex flex-col col-span-2 sm:space-y-6 sm:mt-0 mb-0">
              <hr className="block border-t border-zinc-200" />
              {user.Thread.map((thread, index) => {
                return (
                  <FeedItem
                    key={thread.id}
                    thread={thread}
                    length={length}
                    index={index}
                    userId={user.id}
                  />
                );
              })}
            </ul>
          </div>
          <hr className="hidden sm:block border-t border-zinc-200 mt-4" />
          <div className="flex items-center gap-2 mb-4 mt-4 p-1.5 sm:p-0">
            {user.image && (
              <Image
                src={user.image}
                alt={user?.name ?? "user"}
                width="40"
                height="40"
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold leading-6 text-gray-900">
                {user.username}&#39;s Comments ({user._count.Comment})
              </h2>
              <p className="text-sm text-gray-500">
                Showing comments by {user.username}
              </p>
            </div>
          </div>
          <hr className="block sm:hidden border-t border-zinc-200" />
          {/* Display of user's threads */}
          <ul className="flex flex-col col-span-2 sm:space-y-6 sm:mt-0 mb-0 0">
            {user.Comment.map((comment) => {
              const topLevelCommentVote = comment.votes.find(
                (vote) => vote.userId === session?.user.id
              );

              return (
                <div
                  key={comment.id}
                  className="sm:border-0 border-b border-zinc-200 p-1.5 sm:rounded-md bg-white sm:shadow"
                >
                  <CollapsibleComment
                    threadId={comment.threadId}
                    votesAmt={comment.score}
                    currentVote={topLevelCommentVote}
                    comment={comment}
                    session={session}
                  />
                </div>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Page;
