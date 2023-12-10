"use client";

import { VoteClientProvider } from "./VoteClientProvider";

interface VoteClientProps {
  threadId: string;
  initialVotesAmt: number;
  initialVote?: "UP" | "DOWN" | null;
  children: React.ReactNode;
}

const VoteClient = ({
  threadId,
  initialVotesAmt,
  initialVote,
  children,
}: VoteClientProps) => {
  return (
    <VoteClientProvider
      threadId={threadId}
      initialVotesAmt={initialVotesAmt}
      initialVote={initialVote}
    >
      {children}
    </VoteClientProvider>
  );
};

export default VoteClient;
