"use client";

import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

import { CommentRequest } from "@/lib/validators/comment";
import { toast, useAuthToast } from "@/hooks";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";

interface CreateCommentProps {
  threadId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ threadId, replyToId }) => {
  const router = useRouter();

  const [input, setInput] = useState<string>("");
  const { loginToast } = useAuthToast();

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
    setInput("");
  };

  const { mutate: createComment, isLoading } = useMutation({
    mutationFn,
    onError,
    onSuccess,
  });

  return (
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
        <div className="mt-2 flex justify-end">
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => createComment({ threadId, text: input, replyToId })}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
