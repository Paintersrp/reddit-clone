"use client";

import { ChevronLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { buttonVariants } from "./Button";
import { cn } from "@/lib/utils";

const ToFeedButton = () => {
  const pathname = usePathname();
  const subredditPath = getSubredditPath(pathname);

  return (
    <a
      href={subredditPath}
      className={cn(
        buttonVariants({
          variant: "ghost",
          size: "xs",
          className: "m-2 sm:m-0 sm:my-2 text-[0.8rem] sm:text-base",
        })
      )}
    >
      <ChevronLeft className="h-[0.85rem] w-[0.85rem] sm:h-4 sm:w-4 mr-1" />
      {subredditPath === "/" ? "Back Home" : `Back to ${subredditPath}`}
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
