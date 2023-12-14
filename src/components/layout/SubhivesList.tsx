"use client";

import { type Prisma, type Subhive } from "@prisma/client";
import Link from "next/link";
import { FC, useMemo } from "react";

interface SubhivesListProps {
  subhives: (Subhive & {
    _count: Prisma.SubhiveCountOutputType;
  })[];
}

const SubhivesList: FC<SubhivesListProps> = ({ subhives }) => {
  // Memoized sorted array of all subhives
  const sortedSubhives = useMemo(() => {
    return subhives.sort((a, b) => a.name.localeCompare(b.name));
  }, [subhives]);

  return (
    <>
      <h1 className="font-bold text-xl sm:text-2xl md:text-3xl m-2 ml-4 sm:ml-0">
        Browse all our communities
      </h1>
      <ul className="divide-y divide-gray-200">
        {sortedSubhives.map((subhive) => (
          <li
            key={subhive.id}
            id={subhive.name[0].toUpperCase()}
            className="w-full hover:bg-gray-100 flex justify-between items-center"
          >
            <Link
              href={`/hive/${subhive.name}`}
              className="px-4 py-2 hover:bg-gray-100 w-full flex flex-row items-center justify-between"
            >
              <span className="text-base sm:text-lg font-medium text-zinc-900 ">
                {subhive.name}
              </span>

              <div className="flex gap-2">
                <span className="flex flex-row whitespace-nowrap text-xs font-medium bg-zinc-200 text-zinc-900 px-2 py-1 rounded-full">
                  {subhive._count.threads} Threads
                </span>
                <span className="text-xs font-medium whitespace-nowrap bg-zinc-200 text-zinc-900 px-2 py-1 rounded-full">
                  {subhive._count.subscribers} Subscribers
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SubhivesList;
