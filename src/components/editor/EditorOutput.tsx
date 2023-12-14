"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { FC } from "react";

interface EditorOutputProps {
  content: any;
}

// Dynamic import to handle issues with SSR/NextJS
const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false }
);

// Custom render function for image blocks
function ImageRenderer({ data }: any) {
  const src = data.file.url;

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image alt="image" className="object-contain" fill src={src} />
    </div>
  );
}

// Custom render function for code blocks
function CodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-800 rounded-md p-4 overflow-hidden">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
}

// Custom render function for paragraph blocks
function ParagraphRenderer({ data }: any) {
  const paragraphs = data.text
    .split("\n")
    .map((line: string, index: number) => (
      <p key={index} className="text-sm md:text-base leading-relaxed">
        {line}
      </p>
    ));

  return <div className="space-y-2">{paragraphs}</div>;
}

// Custom render function for header blocks
function HeaderRenderer({ data }: any) {
  const Tag = `h${data.level}` as keyof JSX.IntrinsicElements;

  const textSizeMap: { [key: number]: string } = {
    1: "text-6xl",
    2: "text-5xl",
    3: "text-4xl",
    4: "text-3xl",
    5: "text-2xl",
    6: "text-xl",
  };

  return (
    <Tag className={`${textSizeMap[data.level]} font-semibold`}>
      {data.text}
    </Tag>
  );
}

// Custom render function for list blocks
function ListRenderer({ data }: any) {
  const isOrdered = data.style === "ordered";
  const ListTag = isOrdered ? "ol" : "ul";
  const listStyleClass = isOrdered ? "list-decimal" : "list-disc";

  return (
    <ListTag
      className={`${listStyleClass} list-inside space-y-2 text-sm sm:text-base`}
    >
      {data.items.map((item: string, index: number) => (
        <li key={index}>{item}</li>
      ))}
    </ListTag>
  );
}

const renderers = {
  image: ImageRenderer,
  code: CodeRenderer,
  paragraph: ParagraphRenderer,
  header: HeaderRenderer,
  list: ListRenderer,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return <Output data={content} className="text-sm" renderers={renderers} />;
};

export default EditorOutput;
