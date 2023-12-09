"use client";

import { FC, useRef, useState } from "react";
import { CommentVote } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { MessageSquare, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

import { toast, useAuthToast } from "@/hooks";
import { formatTimeToNow } from "@/lib/utils";
import { CommentRequest } from "@/lib/validators/comment";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import UserAvatar from "../ui/UserAvatar";
import CommentVotes from "./CommentVotes";

import type { ExtendedComment } from "@/types/db";
import { DeleteCommentRequest } from "@/lib/validators/delete";

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
  const router = useRouter();
  const commentRef = useRef<HTMLDivElement>(null);
  const { loginToast } = useAuthToast();
  const { data: session } = useSession();

  const [input, setInput] = useState<string>("");
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const replyClick = () => {
    if (!session) return router.push("/sign-in");
    setIsReplying(!isReplying);
  };

  const replyMutate = async ({ threadId, text, replyToId }: CommentRequest) => {
    const payload: CommentRequest = {
      threadId,
      text,
      replyToId,
    };

    const { data } = await axios.patch("/api/subhive/thread/comment", payload);

    return data;
  };

  const replyError = (err: unknown) => {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return loginToast();
      }
    }

    return toast({
      title: "There was a problem.",
      description: "Something went wrong, please try again.",
      variant: "destructive",
    });
  };

  const replySuccess = () => {
    router.refresh();
    setIsReplying(false);
    setInput("");
  };

  const { mutate: createReply, isLoading: replyLoading } = useMutation({
    mutationFn: replyMutate,
    onError: replyError,
    onSuccess: replySuccess,
  });

  // TODO Implement Modal
  // TODO Implement User to Anomymous on Delete as well
  const deleteClick = () => {
    setIsDeleting(!isDeleting);
  };

  const deleteMutate = async ({ commentId }: DeleteCommentRequest) => {
    const payload: DeleteCommentRequest = {
      commentId,
    };

    const { data } = await axios.patch(
      "/api/subhive/thread/comment/delete",
      payload
    );

    return data;
  };

  const deleteError = (err: unknown) => {
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return loginToast();
      }
    }

    return toast({
      title: "There was a problem.",
      description: "Something went wrong, please try again.",
      variant: "destructive",
    });
  };

  const deleteSuccess = () => {
    router.refresh();
    setIsDeleting(false);
  };

  const { mutate: deleteComment, isLoading: deleteLoading } = useMutation({
    mutationFn: deleteMutate,
    onError: deleteError,
    onSuccess: deleteSuccess,
  });

  console.log(session?.user.id === comment.authorId);

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex w-full items-center justify-between">
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
              u/{comment.author.username}
            </p>

            <p className="max-h-40 truncate text-xs text-zinc-500">
              {formatTimeToNow(new Date(comment.createdAt))}
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

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

          {/* TODO Confirm Delete Modal */}
          {/* TODO Also check if comment already has been deleted */}
          {session?.user.id === comment.authorId && (
            <Button
              onClick={() => deleteComment({ commentId: comment.id })}
              className="bg-red-500 hover:bg-red-600"
              size="xxs"
              isLoading={deleteLoading}
            >
              {/* TODO Icon? */}
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>

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
