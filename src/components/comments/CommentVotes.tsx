"use client";

import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { toast, useAuthToast } from "@/hooks";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { cn } from "@/lib/utils";

interface CommentVotesProps {
  commentId: string;
  initialVotesAmt: number;
  initialVote?: Pick<CommentVote, "type"> | undefined;
}

const CommentVotes = ({
  commentId,
  initialVotesAmt,
  initialVote,
}: CommentVotesProps) => {
  // Hook returns function for rendering a toast with a login prompt
  const { loginToast } = useAuthToast();

  // Numeric state for the comment vote score
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);

  // String state for user's current comment vote
  const [currentVote, setCurrentVote] = useState<
    Pick<CommentVote, "type"> | undefined
  >(initialVote);

  // State to maintain and hold the previous vote on changes to the current
  const prevVote = usePrevious(currentVote);

  const mutationFn = async (voteType: VoteType) => {
    // Sets up payload for comment vote creation and sends it to the comment vote creation endpoint
    const payload: CommentVoteRequest = {
      commentId,
      voteType,
    };

    await axios.patch("/api/subhive/thread/comment/vote", payload);
  };

  const onError = (err: unknown, voteType: VoteType) => {
    // Resets states back or forward on fail
    if (voteType === "UP") setVotesAmt((prev) => prev - 1);
    else setVotesAmt((prev) => prev + 1);

    // Reset the current vote to previous
    setCurrentVote(prevVote);

    if (err instanceof AxiosError) {
      // If unauthorized error, show login toast.
      if (err.response?.status === 401) {
        return loginToast();
      }
    }

    // General error toast
    return toast({
      title: "Something went wrong",
      description: "Your vote was not registered, please try again",
      variant: "destructive",
    });
  };

  const onMutate = (type: VoteType) => {
    if (currentVote?.type === type) {
      // If the vote is the same, we remove it
      setCurrentVote(undefined);

      // Then we adjust votes amount optimisticly
      if (type === "UP") setVotesAmt((prev) => prev - 1);
      else if (type === "DOWN") setVotesAmt((prev) => prev + 1);
    } else {
      // If the vote is not the same, we add it
      setCurrentVote({ type });

      if (type === "UP") setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
      else if (type === "DOWN")
        setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
    }
  };

  const { mutate: vote } = useMutation({
    mutationFn,
    onError,
    onMutate,
  });

  return (
    <div className="flex gap-1">
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant="ghost"
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote?.type === "UP",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>
      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        variant="ghost"
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVotes;
