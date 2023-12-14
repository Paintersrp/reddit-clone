"use client";

import type { Session } from "next-auth";
import type { ExtendedCommentWithReplies } from "@/types/db";

import { FC } from "react";

import CollapsibleComment from "./CollapsibleComment";

interface CommentWithRepliesProps {
  comment: ExtendedCommentWithReplies;
  session: Session | null;
  threadId: string;
}

const CommentWithReplies: FC<CommentWithRepliesProps> = ({
  comment,
  session,
  threadId,
}) => {
  // Retrieve the user's current vote for the comment
  const topLevelCommentVote = comment.votes.find(
    (vote) => vote.userId === session?.user.id
  );

  return (
    <div className="flex flex-col">
      {/* Render collapsible comment client component */}
      <CollapsibleComment
        threadId={threadId}
        votesAmt={comment.score}
        currentVote={topLevelCommentVote}
        comment={comment}
        session={session}
      />
    </div>
  );
};

export default CommentWithReplies;
