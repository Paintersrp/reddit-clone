"use client";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { toast, useAuthToast } from "@/hooks";
import { CommentRequest } from "@/lib/validators/comment";

interface CreateCommentProps {
  threadId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ threadId, replyToId }) => {
  // Setup router for success navigation
  const router = useRouter();

  // String state for the comment text
  const [input, setInput] = useState<string>("");

  // Hook returns function for rendering a toast with a login prompt
  const { loginToast } = useAuthToast();

  const mutationFn = async ({ threadId, text, replyToId }: CommentRequest) => {
    // Sets up payload for creating a comment and sends it to the creation endpoint
    const payload: CommentRequest = {
      threadId,
      text,
      replyToId,
    };

    const { data } = await axios.patch("/api/subhive/thread/comment", payload);

    return data;
  };

  const onError = (err: unknown) => {
    // If error is 401 Unauthorized, send a toast with a login prompt
    if (err instanceof AxiosError) {
      if (err.response?.status === 401) {
        return loginToast();
      }
    }

    // Render toast for general error
    return toast({
      title: "There was a problem.",
      description: "Something went wrong, please try again.",
      variant: "destructive",
    });
  };

  const onSuccess = () => {
    // Refresh and reset input
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
      <Label htmlFor="comment" className="text-sm">
        Your comment
      </Label>
      <div className="mt-">
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
