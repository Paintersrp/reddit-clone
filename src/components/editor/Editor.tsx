"use client";

import type EditorJS from "@editorjs/editorjs";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import TextAreaAutosize from "react-textarea-autosize";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";

import {
  ThreadCreationRequest,
  ThreadValidator,
} from "@/lib/validators/thread";
import { uploadFiles } from "@/lib/uploadthing";
import { toast } from "@/hooks/use-toast";
import { EditorSkeleton } from "./EditorSkeleton";

interface EditorProps {
  subhiveId: string;
}

const Editor: FC<EditorProps> = ({ subhiveId }) => {
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

  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<EditorJS>();
  const _titleRef = useRef<HTMLTextAreaElement>(null);

  const [isMounted, setIsMounted] = useState<boolean>(false);

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMounted(true);
    }
  }, []);

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

  useEffect(() => {
    const init = async () => {
      await initEditor();

      setTimeout(() => {
        _titleRef.current?.focus;
      });
    };

    if (isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initEditor]);

  const { mutate: createThread } = useMutation({
    mutationFn: async ({
      title,
      content,
      subhiveId,
    }: ThreadCreationRequest) => {
      const payload: ThreadCreationRequest = {
        title,
        subhiveId,
        content,
      };

      const { data } = await axios.post("/api/subhive/thread/create", payload);

      return data;
    },
    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "Your thread was not published, please try again later.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      const newPathname = pathname.split("/").slice(0, -1).join("/");
      router.push(newPathname);
      router.refresh();

      return toast({
        description: "Your post has been published",
      });
    },
  });

  async function onSubmit(data: ThreadCreationRequest) {
    const blocks = await ref.current?.save();

    const payload: ThreadCreationRequest = {
      title: data.title,
      content: blocks,
      subhiveId,
    };

    createThread(payload);
  }

  if (!isMounted) return <EditorSkeleton />;

  const { ref: titleRef, ...rest } = register("title");

  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form
        id="subhive-post-form"
        className="w-fit"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextAreaAutosize
            ref={(e) => {
              titleRef(e);
              // @ts-ignore
              _titleRef.current = e;
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className="min-h-[500px]" />
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
