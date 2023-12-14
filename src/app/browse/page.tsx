import Link from "next/link";
import { Scale, Trophy } from "lucide-react";

import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import SubhivesList from "../../components/layout/SubhivesList";
import AlphabetNavigation from "../../components/layout/AlphabetNavigation";
import {
  SideCard,
  SideCardContent,
  SideCardHeader,
} from "@/components/layout/SideCard";

const Page = async () => {
  const subhives = await db.subhive.findMany({
    include: {
      _count: true,
    },
  });

  const topSubhives = [...subhives]
    .sort((a, b) => b._count.threads - a._count.threads)
    .slice(0, 5);

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-[32px] w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-4 md:gap-x-4 sm:py-6 ">
        {/* Right Display */}
        <div className="order-first md:order-last space-y-4">
          <SideCard mobileHide={false}>
            <SideCardHeader>
              <Icons.Logo className="w-7 h-7 mr-2" />
              <h1 className="text-lg">Explore Our Communities</h1>
            </SideCardHeader>
            <SideCardContent>
              <p className="text-zinc-500 py-2 md:py-3">
                Discover and engage in diverse communities. Find spaces that
                match your interests, from hobbies to professional topics.
              </p>
              <p className="text-zinc-500 pb-2 md:pb-3">
                Can&apos;t find what you&apos;re looking for? Start your own
                community and bring people together around your passion.
              </p>
              <Link
                href="/hive/create"
                className={buttonVariants({
                  className: "w-full mb-2",
                })}
              >
                Create Community
              </Link>
            </SideCardContent>
          </SideCard>

          <SideCard>
            <SideCardHeader>
              <Scale className="w-7 h-7 mr-2" />
              <h1 className="text-lg">General Guidelines</h1>
            </SideCardHeader>
            <SideCardContent>
              <p className="text-zinc-500 py-2 md:py-3">
                We believe in respectful and constructive discussions. Here are
                some guidelines to help foster a positive environment:
              </p>
              <ul className="list-disc pl-5 text-zinc-500">
                <li>Be kind and courteous to others.</li>
                <li>Respect differing opinions and viewpoints.</li>
                <li>Avoid spamming and posting off-topic content.</li>
                <li>
                  Follow each community&apos;s specific rules and guidelines.
                </li>
              </ul>
            </SideCardContent>
          </SideCard>

          <SideCard>
            <SideCardHeader>
              <Trophy className="w-7 h-7 mr-2" />
              <h1 className="text-lg">Most Popular Communities</h1>
            </SideCardHeader>
            <SideCardContent>
              {topSubhives.map((subhive) => (
                <Link key={subhive.id} href={`/hive/${subhive.name}`}>
                  <div className="block hover:bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-zinc-700">
                        hive/{subhive.name}
                      </span>
                      <span className="text-xs font-medium bg-emerald-100 text-zinc-900 px-2 py-1 rounded-full">
                        {subhive._count.threads} Threads
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </SideCardContent>
          </SideCard>
        </div>

        {/* Left Display */}
        <div className="col-span-2 w-full">
          <div className="flex flex-row w-full">
            <div className="w-12 sm:w-14">
              <AlphabetNavigation subhives={subhives} />
            </div>
            <div className="w-full">
              <SubhivesList subhives={subhives} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
