import { Dispatch, FC, ReactNode, SetStateAction } from "react";

export type SortOptions = "newest" | "oldest" | "top" | "worst";

interface FeedSortToolbarProps {
  currentOption: SortOptions;
  setSortOption: Dispatch<SetStateAction<SortOptions>>;
}

const FeedSortToolbar: FC<FeedSortToolbarProps> = ({
  currentOption,
  setSortOption,
}) => {
  const sortItems: { option: SortOptions; text: string }[] = [
    { option: "newest", text: "Newest" },
    { option: "oldest", text: "Oldest" },
    { option: "top", text: "Top" },
    { option: "worst", text: "Worst" },
  ];

  return (
    <div className="overflow-hidden sm:rounded-md mb-0 sm:mb-4 bg-white shadow sm:border-0 border-b border-zinc-200 flex space-x-2 p-2">
      {sortItems.map((item, index) => {
        return (
          <FeedSortToolbarItem
            key={index}
            currentOption={currentOption}
            setSortOption={setSortOption}
            option={item.option}
          >
            {item.text}
          </FeedSortToolbarItem>
        );
      })}
    </div>
  );
};

interface FeedSortToolbarItemProps {
  currentOption: SortOptions;
  setSortOption: Dispatch<SetStateAction<SortOptions>>;
  option: SortOptions;
  children: ReactNode;
}

const FeedSortToolbarItem: FC<FeedSortToolbarItemProps> = ({
  currentOption,
  setSortOption,
  option,
  children,
}) => {
  return (
    <button
      onClick={() => setSortOption(option)}
      className={`px-3 py-1 rounded-full text-sm font-semibold ${
        currentOption === option ? "bg-green-500 text-white" : "bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
};

export { FeedSortToolbar, FeedSortToolbarItem };
