"use client";

import { FC, useRef, useState } from "react";

import { ExtendedComment } from "@/types/db";
import UserAvatar from "../ui/UserAvatar";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { CommentVote } from "@prisma/client";
import { Button } from "../ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast, useAuthToast } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

interface CommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  threadId: string;
}

const Comment: FC<CommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  threadId,
}) => {
  const router = useRouter();
  const commentRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { loginToast } = useAuthToast();

  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  const replyClick = () => {
    if (!session) return router.push("/sign-in");
    setIsReplying(!isReplying);
  };

  const mutationFn = async ({ threadId, text, replyToId }: CommentRequest) => {
    console.log(replyToId);
    const payload: CommentRequest = {
      threadId,
      text,
      replyToId,
    };

    const { data } = await axios.patch("/api/subhive/thread/comment", payload);

    return data;
  };

  const onError = (err: unknown) => {
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

  const onSuccess = () => {
    router.refresh();
    setIsReplying(false);
    setInput("");
  };

  const { mutate: createReply, isLoading } = useMutation({
    mutationFn,
    onError,
    onSuccess,
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
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

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />

        <Button onClick={replyClick} variant="ghost" size="xs">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

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
                  isLoading={isLoading}
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