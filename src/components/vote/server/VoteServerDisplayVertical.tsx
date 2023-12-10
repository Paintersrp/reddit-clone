import { FC } from "react";
import { Button } from "../../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoteServerDisplayVerticalProps {
  handleVote: any;
  currentVote: "UP" | "DOWN" | null | undefined;
  votesAmt: number;
}

const VoteServerDisplayVertical: FC<VoteServerDisplayVerticalProps> = ({
  handleVote,
  currentVote,
  votesAmt,
}) => {
  return (
    <div className="flex flex-col pr-1 sm:pr-2">
      <Button
        onClick={() => handleVote("UP")}
        size="xxs"
        variant="ghost"
        aria-label="upvote"
        className="focus-visible:none"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>
      
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>

      <Button
        onClick={() => handleVote("DOWN")}
        size="xxs"
        variant="ghost"
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default VoteServerDisplayVertical;
