import { FC } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { useVote } from "./VoteClientProvider";

const VoteClientDisplayHorizontal: FC = ({}) => {
  const { vote, votesAmt, currentVote } = useVote();

  return (
    <div className="flex flex-row items-center !rounded-full !bg-zinc-50 !border border-zinc-100 m-2 gap-1">
      <ArrowBigUp
        onClick={() => vote("UP")}
        className={cn("h-5 w-5 text-zinc-700 cursor-pointer mx-1 sm:m-2", {
          "text-emerald-500 fill-emerald-500": currentVote === "UP",
        })}
      />

      <p className="text-center font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>

      <ArrowBigDown
        onClick={() => vote("DOWN")}
        className={cn("h-5 w-5 text-zinc-700 cursor-pointer mx-1 sm:m-2", {
          "text-red-500 fill-red-500": currentVote === "DOWN",
        })}
      />
    </div>
  );
};

export default VoteClientDisplayHorizontal;
