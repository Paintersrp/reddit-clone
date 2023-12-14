"use client";

import "@/styles/editor.css";
import type EditorJS from "@editorjs/editorjs";

import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import TextAreaAutosize from "react-textarea-autosize";

import { toast } from "@/hooks/use-toast";
import { uploadFiles } from "@/lib/uploadthing";
import {
  ThreadCreationRequest,
  ThreadValidator,
} from "@/lib/validators/thread";
import { EditorSkeleton } from "./EditorSkeleton";

interface EditorProps {
  subhiveId: string;
}

const Editor: FC<EditorProps> = ({ subhiveId }) => {
  // Setup react hook form with validator and default values
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ThreadCreationRequest>({
    resolver: zodResolver(ThreadValidator),
    defaultValues: {
      subhiveId,
      title: "",
      content: null,
    },
  });

  // Setup router for success navigation
  const router = useRouter();

  // Retrieve pathname
  const pathname = usePathname();

  // Setup ref for Editor
  const ref = useRef<EditorJS>();

  // Setup ref for title text area
  const _titleRef = useRef<HTMLTextAreaElement>(null);

  // Boolean state to handle whether the component has mounted or not
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Initialize the editor with lazy-load imports
  const initEditor = useCallback(async () => {
    const EditorJS = (await import("@editorjs/editorjs")).default;
    const Header = (await import("@editorjs/header")).default;
    const Embed = (await import("@editorjs/embed")).default;
    const Table = (await import("@editorjs/table")).default;
    const List = (await import("@editorjs/list")).default;
    const Code = (await import("@editorjs/code")).default;
    const LinkTool = (await import("@editorjs/link")).default;
    const InlineCode = (await import("@editorjs/inline-code")).default;
    const ImageTool = (await import("@editorjs/image")).default;

    // Create Editor
    if (!ref.current) {
      const editor = new EditorJS({
        holder: "editor",
        onReady() {
          ref.current = editor;
        },
        placeholder: "Type here to write your content...",
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: "/api/link",
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                // Uploads using helper function from uploadthing
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles([file], "imageUploader");

                  return {
                    success: 1,
                    file: { url: res.fileUrl },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  // Once mounted, set isMounted to true
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

  // Checks errors returned by react form hook for errors, and displays those errors in toasts
  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_, value] of Object.entries(errors)) {
        toast({
          title: "Something went wrong",
          description: (value as { message: string }).message,
          variant: "destructive",
        });
      }
    }
  }, [errors]);

  // Checks if component has mounted, and if so initializes the editor with our initEditor function
  useEffect(() => {
    const init = async () => {
      await initEditor();

      // Sets focus to the title input once mounted fully
      setTimeout(() => {
        _titleRef.current?.focus;
      });
    };

    // If mounted, initialize editor with cleanup
    if (isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initEditor]);

  const mutationFn = async ({
    title,
    content,
    subhiveId,
  }: ThreadCreationRequest) => {
    // Sets up thread creation payload and sends it to the thread creation endpoint
    const payload: ThreadCreationRequest = {
      title,
      subhiveId,
      content,
    };

    const { data } = await axios.post("/api/subhive/thread/create", payload);

    return data;
  };

  const onError = () => {
    // Handles creation errors with toast
    return toast({
      title: "Something went wrong.",
      description: "Your thread was not published, please try again later.",
      variant: "destructive",
    });
  };

  const onSuccess = () => {
    // On successful thread creation, we navigate to the new thread path
    const newPathname = pathname.split("/").slice(0, -1).join("/");
    router.push(newPathname);
    router.refresh();

    // We also display a success toast
    return toast({
      description: "Your post has been published",
    });
  };

  const { mutate: createThread } = useMutation({
    mutationFn,
    onError,
    onSuccess,
  });

  // Form Submission
  async function onSubmit(data: ThreadCreationRequest) {
    // Get blocks from editor reference using .save()
    const blocks = await ref.current?.save();

    // Set up payload for thread creation
    const payload: ThreadCreationRequest = {
      title: data.title,
      content: blocks,
      subhiveId,
    };

    // Process payload with createThread mutation function
    createThread(payload);
  }

  // If component hasn't mounted, we display a skeleton display for the Editor
  if (!isMounted) return <EditorSkeleton />;

  // After mounting, we register the refs with react hook form
  const { ref: titleRef, ...rest } = register("title");

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form
        id="subhive-post-form"
        className=""
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextAreaAutosize
            ref={(e) => {
              // We manage the react hook form title ref and our manual _titleRef
              titleRef(e);
              // @ts-ignore
              _titleRef.current = e;
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className="min-h-[300px]" />
          <p className="text-sm text-gray-500">
            Use{" "}
            <kbd className="rounded-md border bg-muted px-1 text-xs uppercase">
              Tab
            </kbd>{" "}
            to open the command menu.
          </p>
        </div>
      </form>
    </div>
  );
};

export default Editor;
