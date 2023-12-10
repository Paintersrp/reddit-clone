import { notFound } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import SubscribeLeaveToggle from "@/components/layout/SubscribeLeaveToggle";
import ToFeedButton from "@/components/ui/ToFeedButton";

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    slug: string;
  };
}) => {
  const { slug } = params;

  // Retrieve session, if exists
  const session = await getAuthSession();

  // Retrieve subhive data, if exists
  const subhive = await db.subhive.findFirst({
    where: { name: slug },
    include: {
      threads: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  // Retrieve user's subscription status to subhive
  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subhive: {
            name: slug,
          },
          user: {
            id: session.user.id,
          },
        },
      });

  // Boolean of user subscription status
  const isSubscribed = !!subscription;

  // Return not found if no subhive for slug
  if (!subhive) return notFound();

  // Member count of user's subscribed to subhive
  const memberCount = await db.subscription.count({
    where: {
      subhive: {
        name: slug,
      },
    },
  });

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-[32px] md:pb-8">
      <div>
        {/* Replace with backwards info / navigation bar */}
        <ToFeedButton />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4">
          <div className="flex flex-col col-span-2 sm:space-y-6">
            {children}
          </div>

          {/* Menu on mobile? */}
          <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
            <div className="px-6 py-4">
              <p className="font-semibold py-3">About hive/{subhive.name}</p>
            </div>

            <dl className="divide-y divide-gray-100 px-6 py-4 text-sm lreading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">
                  <time dateTime={subhive.createdAt.toDateString()}>
                    {format(subhive.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Members</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dd>
              </div>

              {/* If user is creator, display that instead of leave community button */}
              {subhive.creatorId === session?.user.id ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <p className="text-gray-500">You created this subhive</p>
                </div>
              ) : null}

              {/* If user is not creator, display leave community button */}
              {subhive.creatorId !== session?.user.id ? (
                <SubscribeLeaveToggle
                  subhiveId={subhive.id}
                  subhiveName={subhive.name}
                  isSubscribed={isSubscribed}
                />
              ) : null}

              <Link
                href={`hive/${slug}/submit`}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full mb-6",
                })}
              >
                Create thread
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
