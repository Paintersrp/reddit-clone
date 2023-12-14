import { FC } from "react";

// Unused, WIP
const ThreadSkeleton: FC = () => {
  return (
    <div className="animate-pulse sm:rounded-md bg-white shadow sm:border-0 border-b border-zinc-200 p-1.5">
      <div className="px-3 py-2 sm:px-6 sm:py-4 flex justify-between">
        <div className="w-0 flex-1 space-y-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
      <div className="z-20 text-sm sm:p-4 sm:px-6 flex">
        <div className="w-12 h-6 bg-gray-300 rounded-full p-2"></div>
        <div className="w-20 h-6 bg-gray-300 rounded-full p-2"></div>
      </div>
    </div>
  );
};

export default ThreadSkeleton;
