"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";

const ToFeedButton = () => {
  const pathname = usePathname();
  const subredditPath = getSubredditPath(pathname);

  return (
    <a
      href={subredditPath}
      className="m-0 sm:my-2 text-[0.8rem] sm:text-base bg-transparent hover:bg-zinc-100 text-zinc-800 flex items-center justify-between py-2"
    >
      <span className="flex items-center font-medium ml-2">
        <ChevronLeft className="h-[0.85rem] w-[0.85rem] sm:h-4 sm:w-4 mr-1" />
        {subredditPath === "/" ? "Back Home" : `Back`}
      </span>
      <span className="mr-2 text-xs font-medium">
        {subredditPath !== "/" && subredditPath}
      </span>
    </a>
  );
};

const getSubredditPath = (pathname: string) => {
  const splitPath = pathname.split("/");

  if (splitPath.length === 3) return "/";
  else if (splitPath.length > 3) return `/${splitPath[1]}/${splitPath[2]}`;
  // default path, in case pathname does not match expected format
  else return "/";
};

export default ToFeedButton;
