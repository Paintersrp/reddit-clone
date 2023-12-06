import TextAreaAutosize from "react-textarea-autosize";

export const EditorSkeleton = () => (
  <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
    <TextAreaAutosize
      disabled
      placeholder="Title"
      className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
    />
    <div className="min-h-[300px]">
      <div className="h-[300px] bg-gray-200 rounded animate-pulse" />
    </div>
  </div>
);

export default EditorSkeleton;
