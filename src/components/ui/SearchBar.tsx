"use client";

import { Subhive, Thread } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { MessageSquareDashed, Users } from "lucide-react";
import debounce from "lodash.debounce";
import axios from "axios";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface QueryResults {
  threads: (Thread & { subhive: Subhive })[];
  hives: Subhive[];
}

const SearchBar: FC = ({}) => {
  const [input, setInput] = useState<string>("");
  const pathname = usePathname();
  const commandRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  const request = debounce(async () => {
    refetch();
  }, 300);

  const debounceRequest = useCallback(() => {
    request();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    isFetching,
    data: queryResults,
    refetch,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      const { data } = await axios.get(`/api/search?q=${input}`);

      return data as QueryResults;
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  useEffect(() => {
    setInput("");
  }, [pathname]);

  return (
    <Command
      ref={commandRef}
      className="relative rounded-lg border max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        isLoading={isFetching}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        value={input}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search..."
      />

      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}

          {/* Communities Search Results */}
          {(queryResults?.hives?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResults?.hives?.map((subhive: Subhive) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/hive/${e}`);
                    router.refresh();
                  }}
                  key={subhive.id}
                  value={subhive.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/hive/${subhive.name}`}>hive/{subhive.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {/* Threads Search Results */}
          {(queryResults?.threads?.length ?? 0) > 0 ? (
            <CommandGroup heading="Threads">
              {queryResults?.threads?.map((thread) => (
                <CommandItem
                  onSelect={() => {
                    router.push(
                      `/hive/${thread.subhive.name}/thread/${thread.id}`
                    );
                    router.refresh();
                  }}
                  key={thread.id}
                  value={thread.title}
                >
                  <div className="w-full flex justify-between items-center">
                    <div className="flex">
                      <MessageSquareDashed className="mr-2 h-4 w-4" />
                      <a
                        href={`/hive/${thread.subhive.name}/thread/${thread.id}`}
                      >
                        {thread.title}
                      </a>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span>hive/{thread.subhive.name}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
