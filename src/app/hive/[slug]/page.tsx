import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { INFINITE_SCROLLING_PER_PAGE } from "@/config";

import CreateThread from "@/components/CreateThread";

interface PageProps {
  params: {
    slug: string;
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
        },

        take: INFINITE_SCROLLING_PER_PAGE,
      },
    },
  });

  if (!subhive) return notFound();

  return (
    <div>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        hive/{subhive.name}
      </h1>

      <CreateThread session={session} />
    </div>
  );
};

export default Page;
