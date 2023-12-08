"use client";

import { FC, useState } from "react";
import { type Comment as CommentType, CommentVote, User } from "@prisma/client";
import { Session } from "next-auth";
import { motion, AnimatePresence } from "framer-motion";

import { formatTimeToNow } from "@/lib/utils";
import { Button } from "../ui/Button";
import Comment from "./Comment";
import CommentWithReplies from "./CommentWithReplies";

interface CollapsibleCommentProps {
  threadId: string;
  votesAmt: number;
  currentVote: CommentVote | undefined;
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
}

const CollapsibleComment: FC<CollapsibleCommentProps> = ({
  threadId,
  votesAmt,
  currentVote,
  comment,
  session,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Render the comment */}
            <div className="mb-2">
              <Comment
                threadId={threadId}
                votesAmt={votesAmt}
                currentVote={currentVote}
                comment={comment}
                isCollapsed={isCollapsed}
                handleCollapse={handleCollapse}
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {/* Collapsed Comment Display */}
        {isCollapsed && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex w-full items-center justify-between bg-zinc-300 rounded p-1.5">
              <div className="flex w-full justify-between">
                <div className="ml-2 flex items-center gap-x-2">
                  <p className="text-sm font-medium text-gray-900">
                    u/{comment.author.username}
                  </p>

                  <p className="max-h-40 truncate text-xs text-zinc-500">
                    {formatTimeToNow(new Date(comment.createdAt))}
                  </p>
                </div>
                <Button
                  onClick={handleCollapse}
                  className="mr-1"
                  variant="outline"
                  size="xxs"
                >
                  Expand
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CollapsibleComment;
