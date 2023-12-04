import { FC } from "react";
import { Thread, Vote, VoteType } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { reduceVotes } from "@/lib/redis";
import VoteClient from "./VoteClient";

interface VoteServerProps {
  threadId: string;
  initialVotesAmt?: number;
  initialVote?: VoteType | null;
  getData?: () => Promise<(Thread & { votes: Vote[] }) | null>;
}

const VoteServer = async ({
  threadId,
  initialVotesAmt,
  initialVote,
  getData,
}: VoteServerProps) => {
  const session = await getAuthSession();

  let _votesAmt: number = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const thread = await getData();

    if (!thread) return notFound();

    _votesAmt = reduceVotes(thread);
    _currentVote = thread.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  } else {
    _votesAmt = initialVotesAmt!;
    _currentVote = initialVote!;
  }

  return (
    <VoteClient
      threadId={threadId}
      initialVotesAmt={_votesAmt}
      initialVote={_currentVote}
    />
  );
};

export default VoteServer;
