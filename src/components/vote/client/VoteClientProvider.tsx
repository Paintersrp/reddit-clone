import React, { createContext, useContext, useState, useEffect } from "react";
import { VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { usePrevious } from "@mantine/hooks";

import { ThreadVoteRequest } from "@/lib/validators/vote";
import { toast, useAuthToast } from "@/hooks";

interface VoteContextType {
  vote: (type: VoteType) => void;
  votesAmt: number;
  currentVote: "UP" | "DOWN" | null | undefined;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const useVote = () => {
  const context = useContext(VoteContext);
  if (context === undefined) {
    throw new Error("useVote must be used within a VoteClientProvider");
  }
  return context;
};

interface VoteClientProviderProps {
  threadId: string;
  initialVotesAmt: number;
  initialVote?: "UP" | "DOWN" | null;
  children: React.ReactNode;
}

export const VoteClientProvider: React.FC<VoteClientProviderProps> = ({
  threadId,
  initialVotesAmt,
  initialVote,
  children,
}) => {
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

  // Context value
  const value = {
    vote,
    votesAmt,
    currentVote,
  };

  return <VoteContext.Provider value={value}>{children}</VoteContext.Provider>;
};
