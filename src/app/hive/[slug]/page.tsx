import { notFound } from "next/navigation";
import { Metadata } from "next";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { INFINITE_SCROLLING_PER_PAGE } from "@/config";

import CreateThread from "@/components/threads/CreateThread";
import ThreadFeed from "@/components/feed/ThreadFeed";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = params;

  return {
    title: `Hivemind - hive/${slug}`,
    description: `Hivemind community for ${slug}`,
  };
}

const Page = async ({ params }: PageProps) => {
  const { slug } = params;

  const session = await getAuthSession();

  const subhive = await db.subhive.findFirst({
    where: { name: slug },
    include: {
      threads: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subhive: true,
          _count: true,
        },
        orderBy: { createdAt: "desc" },
        take: INFINITE_SCROLLING_PER_PAGE,
      },
    },
  });

  if (!subhive) return notFound();

  return (
    <>
      <h1 className="font-bold text-2xl md:text-3xl m-2 ml-4 sm:ml-0">
        hive/{subhive.name}
      </h1>

      <CreateThread session={session} />
      <ThreadFeed initialThreads={subhive.threads} subhiveName={subhive.name} />
    </>
  );
};

export default Page;
