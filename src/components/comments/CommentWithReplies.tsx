"use client";

import { Session } from "next-auth";
import { type Comment as CommentType, CommentVote, User } from "@prisma/client";
import { FC } from "react";

import { tallyVoteScore } from "@/lib/tally";
import CollapsibleComment from "./CollapsibleComment";

interface CommentWithRepliesProps {
  comment: CommentType & {
    votes: CommentVote[];
    replies: (CommentType & {
      votes: CommentVote[];
      author: User;
      replyTo: CommentType | null;
      replies: any;
    })[];
    author: User;
  };
  session: Session | null;
  threadId: string;
}

const CommentWithReplies: FC<CommentWithRepliesProps> = ({
  comment,
  session,
  threadId,
}) => {
  const topLevelCommentVotesAmt = tallyVoteScore(comment);
  const topLevelCommentVote = comment.votes.find(
    (vote) => vote.userId === session?.user.id
  );

  return (
    <div className="flex flex-col">
      <CollapsibleComment
        threadId={threadId}
        votesAmt={topLevelCommentVotesAmt}
        currentVote={topLevelCommentVote}
        comment={comment}
        session={session}
      />
    </div>
  );
};

export default CommentWithReplies;
