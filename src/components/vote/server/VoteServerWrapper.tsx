import { Thread, Vote, VoteType } from "@prisma/client";
import { notFound } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { tallyVoteScore } from "@/lib/tally";
import VoteServer from "./VoteServer";
import { db } from "@/lib/db";

interface VoteServerWrapperProps {
  threadId: string;
  initialVotesAmt?: number;
  initialVote?: VoteType | null;
  getData?: () => Promise<(Thread & { votes: Vote[] }) | null>;
}

const VoteServerWrapper = async ({
  threadId,
  initialVotesAmt,
  initialVote,
  getData,
}: VoteServerWrapperProps) => {
  const session = await getAuthSession();

  let _votesAmt: number = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const thread = await getData();

    if (!thread) return notFound();

    _votesAmt = tallyVoteScore(thread);
    _currentVote = thread.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;

    await db.thread.update({
      where: {
        id: thread.id,
      },
      data: {
        score: _votesAmt,
      },
    });
    
  } else {
    _votesAmt = initialVotesAmt!;
    _currentVote = initialVote!;
  }

  return (
    <VoteServer
      threadId={threadId}
      initialVotesAmt={_votesAmt}
      initialVote={_currentVote}
    />
  );
};

export default VoteServerWrapper;
