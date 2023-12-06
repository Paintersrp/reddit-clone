"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { FC } from "react";

interface EditorOutputProps {
  content: any;
}

const Output = dynamic(
  async () => (await import("editorjs-react-renderer")).default,
  { ssr: false }
);


const style = {
  paragraph: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
};

function ImageRenderer({ data }: any) {
  const src = data.file.url;

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image alt="image" className="object-contain" fill src={src} />
    </div>
  );
}

function CodeRenderer({ data }: any) {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-100 text sm">{data.code}</code>
    </pre>
  );
}

const renderers = {
  image: ImageRenderer,
  code: CodeRenderer,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <Output
      data={content}
      style={style}
      className="text-sm"
      renderers={renderers}
    />
  );
};

export default EditorOutput;