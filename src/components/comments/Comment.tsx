"use client";

import type { ExtendedComment } from "@/types/db";
import type { CommentVote } from "@prisma/client";

import axios, { AxiosError } from "axios";
import { MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { toast, useAuthToast } from "@/hooks";
import { formatTimeToNow } from "@/lib/utils";
import { CommentRequest } from "@/lib/validators/comment";
import DeleteCommentDialog from "@/components/layout/DeleteCommentDialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import UserAvatar from "@/components/layout/UserAvatar";
import CommentVotes from "./CommentVotes";

interface CommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  threadId: string;
  isCollapsed: boolean;
  handleCollapse: () => void;
}

const Comment: FC<CommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  threadId,
  isCollapsed,
  handleCollapse,
}) => {
  // Setup router for success navigation
  const router = useRouter();

  // Ref for comment element
  const commentRef = useRef<HTMLDivElement>(null);

  // Hook returns function for rendering a toast with a login prompt
  const { loginToast } = useAuthToast();

  // Returns session, if it exists
  const { data: session } = useSession();

  // String state for the reply text
  const [input, setInput] = useState<string>("");

  // Boolean state for determining whether to display the reply element
  const [isReplying, setIsReplying] = useState<boolean>(false);

  // Redirects to sign-in if no session otherwise toggles reply element visibility
  const replyClick = () => {
    if (!session) return router.push("/sign-in");
    setIsReplying(!isReplying);
  };

  const replyMutate = async ({ threadId, text, replyToId }: CommentRequest) => {
    // Sets up the new comment/reply payload and sends it to the creation endpoint
    const payload: CommentRequest = {
      threadId,
      text,
      replyToId,
    };

    const { data } = await axios.patch("/api/subhive/thread/comment", payload);

    return data;
  };

  const replyError = (err: unknown) => {
    // If response is 401 Unauthorized, we render a toast with a login prompt
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return loginToast();
      }
    }

    // Handle general error with generic toast
    return toast({
      title: "There was a problem.",
      description: "Something went wrong, please try again.",
      variant: "destructive",
    });
  };

  const replySuccess = () => {
    // On successful reply, we refresh the router and reset states
    router.refresh();
    setIsReplying(false);
    setInput("");
  };

  const { mutate: createReply, isLoading: replyLoading } = useMutation({
    mutationFn: replyMutate,
    onError: replyError,
    onSuccess: replySuccess,
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex w-full items-center justify-between">
        {/* Comment information display (User, Dates) */}
        <div className="flex">
          <UserAvatar
            user={{
              name: comment.author.name || null,
              image: comment.author.image || null,
            }}
            className="h-6 w-6"
          />
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
        </div>
      </div>

      {/* Render comment content */}
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      {/* Render comment voting, collapsing, and reply toolbar */}
      <div className="flex flex-wrap">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-1 md:gap-2">
            <CommentVotes
              commentId={comment.id}
              initialVotesAmt={votesAmt}
              initialVote={currentVote}
            />

            <Button onClick={replyClick} variant="ghost" size="xxs">
              <MessageSquare className="h-4 w-4 mr-1.5" />
              <p className="text-xs md:text-sm">Reply</p>
            </Button>

            <Button onClick={handleCollapse} variant="ghost" size="xxs">
              {/* TODO Icon? */}
              <p className="text-xs md:text-sm">
                {isCollapsed ? "Expand" : "Collapse"}
              </p>
            </Button>
          </div>

          {/* TODO Check if comment already has been deleted */}
          {session?.user.id === comment.authorId && (
            <DeleteCommentDialog commentId={comment.id} />
          )}
        </div>

        {/* Comment reply display */}
        {isReplying ? (
          <div className="grid w-full gap-1.5">
            <Label htmlFor="comment">Your comment</Label>
            <div className="mt-2">
              <Textarea
                id="comment"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  tabIndex={-1}
                  variant="subtle"
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  isLoading={replyLoading}
                  disabled={input.length === 0}
                  onClick={() =>
                    createReply({
                      threadId,
                      text: input,
                      replyToId: comment.id,
                    })
                  }
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Comment;
