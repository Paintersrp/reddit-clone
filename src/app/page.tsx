import { HomeIcon } from "lucide-react";
import Link from "next/link";

import AllFeed from "@/components/feed/AllFeed";
import UserFeed from "@/components/feed/UserFeed";
import CreateThread from "@/components/layout/CreateThread";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";

export default async function Home() {
  const session = await getAuthSession();

  return (
    <>
      <h1 className="hidden sm:block font-bold text-3xl md:text-4xl mt-12 sm:mt-0 mb-2 sm:mb-0">
        Your Feed
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-4 md:gap-x-4 sm:py-6 pt-[32px]">
        {/* Subreddit Info */}
        <div className="sm:block overflow-hidden h-fit sm:rounded-lg border border-gray-200 order-first md:order-last">
          <div className="bg-emerald-100 px-3 py-1 md:px-4 md:py-2">
            <div className="font-semibold py-3 flex items-center gap-1.5">
              <HomeIcon className="w-7 h-7 mr-2" />
              <h1 className="text-2xl">Home</h1>
            </div>
          </div>

          <div className="-my-3 px-4 py-4 md:px-4 md:py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-2 md:py-3">
              <p className="text-zinc-500">
                Your personal Hive. Come here to check in with your favorite
                communities
              </p>
            </div>
            <Link
              href="/hive/create"
              className={buttonVariants({
                className: "w-full mb-2",
              })}
            >
              Create Community
            </Link>
            <Link
              href="/hive/all"
              className={buttonVariants({
                variant: "subtle",
                className:
                  "w-full mb-2 md:mb-4 bg-zinc-200 hover:bg-zinc-300 font-semibold",
              })}
            >
              View hive/all
            </Link>
          </div>
        </div>

        <div className="col-span-2">
          {/* Feed Display */}
          <CreateThread session={session} />

          {/* @ts-expect-error Server Component */}
          {session ? <UserFeed session={session} /> : <AllFeed />}
        </div>
      </div>
    </>
  );
}
