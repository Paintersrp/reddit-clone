import { Session } from "next-auth";
import { type Comment as CommentType, CommentVote, User } from "@prisma/client";
import { FC } from "react";

import { tallyVoteScore } from "@/lib/votes";
import Comment from "./Comment";

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
      {/* Render the comment */}
      <div className="mb-2">
        <Comment
          threadId={threadId}
          votesAmt={topLevelCommentVotesAmt}
          currentVote={topLevelCommentVote}
          comment={comment}
        />
      </div>

      {/* Render replies */}
      {comment.replies?.map((reply) => (
        <div
          key={reply.id}
          className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
        >
          <CommentWithReplies
            comment={reply}
            session={session}
            threadId={threadId}
          />
        </div>
      ))}
    </div>
  );
};

export default CommentWithReplies;
