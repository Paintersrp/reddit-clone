import Link from "next/link";

import { INFINITE_SCROLLING_PER_PAGE } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

import { buttonVariants } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import ThreadFeed from "@/components/feed/ThreadFeed";
import CreateThread from "@/components/layout/CreateThread";

const Page = async () => {
  const session = await getAuthSession();

  const threads = await db.thread.findMany({
    take: INFINITE_SCROLLING_PER_PAGE,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      subhive: true,
      votes: true,
      author: true,
      comments: true,
      _count: true,
    },
  });

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-[32px]">
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-4 md:gap-x-4 sm:py-6">
        <div className="sm:block overflow-hidden h-fit sm:rounded-lg border border-gray-200 order-first md:order-last">
          <div className="bg-emerald-100 px-3 py-1 md:px-4 md:py-2">
            <p className="font-semibold py-3 flex items-center gap-1.5">
              <Icons.Logo className="w-7 h-7 mr-2" />
              <h1 className="text-2xl">All</h1>
            </p>
          </div>

          <div className="-my-3 divide-y divide-gray-100 px-4 py-4 md:px-4 md:py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-2 md:py-3">
              <p className="text-zinc-500">
                The most active posts from all of Hivemind. Come here to see new
                posts rising and be a part of the conversation
              </p>
            </div>
            <Link
              href="/hive/create"
              className={buttonVariants({
                className: "w-full mb-2 md:mt-4 md:mb-6",
              })}
            >
              Create Community
            </Link>
          </div>
        </div>

        <div className="col-span-2">
          <CreateThread session={session} />
          <ThreadFeed initialThreads={threads} all={true} />
        </div>
      </div>
    </div>
  );
};

export default Page;
