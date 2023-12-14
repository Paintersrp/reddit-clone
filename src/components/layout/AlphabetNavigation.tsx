"use client";

import { FC, useMemo, useState } from "react";
import { Subhive } from "@prisma/client";

import { buttonVariants } from "@/components/ui/Button";

interface AlphabetNavigationProps {
  subhives: Subhive[];
}

const AlphabetNavigation: FC<AlphabetNavigationProps> = ({ subhives }) => {
  const [activeLetter, setActiveLetter] = useState("A");

  // Build letters that need to be used for navigation purposes, based on subhive names
  const alphabet = useMemo(() => {
    const chars = new Set(
      subhives.map((subhive) => subhive.name[0].toUpperCase())
    );
    return Array.from(chars).sort();
  }, [subhives]);

  return (
    <div className="sticky top-16 overflow-y-hidden space-y-2 px-1.5 pt-1 pb-1">
      {alphabet.map((letter) => (
        <a
          key={letter}
          href={`#${letter}`}
          onClick={() => setActiveLetter(letter)}
          className={buttonVariants({
            variant: "ghost",
            className: `w-full text-center font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg ${
              activeLetter === letter ? "bg-zinc-300" : ""
            }`,
          })}
        >
          {letter}
        </a>
      ))}
    </div>
  );
};

export default AlphabetNavigation;
