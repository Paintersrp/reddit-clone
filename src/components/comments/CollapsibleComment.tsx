"use client";

import type { CommentVote } from "@prisma/client";
import type { Session } from "next-auth";
import type { ExtendedCommentWithReplies } from "@/types/db";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FC, useState } from "react";

import { Button } from "@/components/ui/Button";
import { formatTimeToNow } from "@/lib/utils";
import Comment from "./Comment";
import CommentWithReplies from "./CommentWithReplies";

interface CollapsibleCommentProps {
  threadId: string;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  comment: ExtendedCommentWithReplies;
  session: Session | null;
}

const CollapsibleComment: FC<CollapsibleCommentProps> = ({
  threadId,
  votesAmt,
  currentVote,
  comment,
  session,
}) => {
  // Boolean state for maintaining collapsed status
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Handle function for collapse state
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Renders comment with recursive rendering of nested comments and replies */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Comment display */}
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

            {/* Comment replies */}
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

      {/* Collapsed comment display */}
      <AnimatePresence>
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
                    <Link
                      href={`/user/${comment.author.username}`}
                      className="text-blue-700 hover:underline"
                    >
                      u/{comment.author.username}
                    </Link>
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
