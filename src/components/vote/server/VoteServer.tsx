"use client";

import { useEffect, useState } from "react";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

import { toast, useAuthToast } from "@/hooks";
import { ThreadVoteRequest } from "@/lib/validators/vote";
import VoteServerDisplayVertical from "./VoteServerDisplayVertical";

interface VoteClientProps {
  threadId: string;
  initialVotesAmt: number;
  initialVote?: "UP" | "DOWN" | null;
}

const VoteServer = ({
  threadId,
  initialVotesAmt,
  initialVote,
}: VoteClientProps) => {
  const { loginToast } = useAuthToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const prevVote = usePrevious(currentVote);

  // Syncs Client and Server
  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: ThreadVoteRequest = {
        threadId,
        voteType,
      };

      await axios.patch("/api/subhive/thread/vote", payload);
    },
    onError: (err, voteType) => {
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
    },
    onMutate: (type: VoteType) => {
      if (currentVote === type) {
        // If the vote is the same, we remove it
        setCurrentVote(undefined);

        // Then we adjust votes amount optimisticly
        if (type === "UP") setVotesAmt((prev) => prev - 1);
        else if (type === "DOWN") setVotesAmt((prev) => prev + 1);
      } else {
        // If the vote is not the same, we add it
        setCurrentVote(type);

        if (type === "UP") setVotesAmt((prev) => prev + (currentVote ? 2 : 1));
        else if (type === "DOWN")
          setVotesAmt((prev) => prev - (currentVote ? 2 : 1));
      }
    },
  });

  return (
    <VoteServerDisplayVertical
      handleVote={vote}
      votesAmt={votesAmt}
      currentVote={currentVote}
    />
  );
};

export default VoteServer;
