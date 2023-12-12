"use client";

import { useEffect, useState } from "react";
import { Loader2, Scale } from "lucide-react";
import { Subhive } from "@prisma/client";
import axios from "axios";

import { Button } from "@/components/ui/Button";
import Editor from "@/components/editor/Editor";
import EditorSkeleton from "@/components/editor/EditorSkeleton";
import { Icons } from "@/components/ui/Icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const Page = () => {
  const [subhive, setSubhive] = useState<string>("");
  const [subhives, setSubhives] = useState<Subhive[]>();

  useEffect(() => {
    const fetchSubhives = async () => {
      const { data } = await axios.get("/api/subhives");
      setSubhives(data);
    };

    fetchSubhives();
  }, []);

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-[32px]">
      <div className="grid grid-cols-1 md:grid-cols-3 md:gap-y-4 md:gap-x-4 sm:py-6 p-1.5">
        <div className="order-first sm:order-last overflow-hidden h-fit space-y-4">
          <div className="hidden md:block sm:rounded-lg border border-gray-200 ">
            <div className="bg-emerald-100 px-3 py-1 md:px-4 md:py-2 sm:rounded-t-lg">
              <p className="font-semibold py-3 flex items-center gap-1.5">
                <Icons.Logo className="w-6 h-6 mr-2" />
                <h1 className="text-xl">Create new thread</h1>
              </p>
            </div>

            <div className="-my-3 divide-y divide-gray-100 px-4 py-4 md:px-4 md:py-4 text-sm leading-6">
              <div className="flex flex-col justify-between gap-y-2 py-2 md:py-3 text-zinc-600">
                <p>
                  Start a conversation, share your thoughts, or ask a question.
                  This is a space for vibrant discussions and insightful
                  opinions!
                </p>
                <p>
                  Remember, the best threads are those that encourage engaging
                  and respectful conversation.
                </p>
                <p>Be creative and express yourself!</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block sm:rounded-lg border border-gray-200">
            <div className="bg-emerald-100 px-3 py-1 md:px-4 md:py-2 sm:rounded-t-lg">
              <p className="font-semibold py-3 flex items-center gap-1.5">
                <Scale className="w-6 h-6 mr-2" />
                <h1 className="text-xl">Rules</h1>
              </p>
            </div>

            <div className="-my-3 divide-y divide-gray-100 px-4 py-4 md:px-4 md:py-4 text-sm leading-6">
              <ul className="list-disc pl-5 text-zinc-600 space-y-2 mt-2 mb-2">
                <li>Respect all members and their opinions.</li>
                <li>Avoid posting sensitive or offensive content.</li>
                <li>Stay on topic and avoid spamming.</li>
                <li>No self-promotion or advertising without permission.</li>
                <li>Follow all community-specific rules.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex flex-col items-start gap-6">
            <div className="border-b border-gray-200 pb-5 w-full">
              <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
                <h3 className="ml-2 mt-7 sm:mt-2 text-lg font-semibold leading-6 text-gray-900">
                  Create Thread
                </h3>
              </div>
            </div>

            {subhives ? (
              <Select onValueChange={setSubhive} value={subhive}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Choose subhive" />
                </SelectTrigger>
                <SelectContent>
                  {subhives.map((subhive) => (
                    <SelectItem key={subhive.id} value={subhive.id}>
                      {subhive.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
              </div>
            )}

            {!subhive ? <EditorSkeleton /> : <Editor subhiveId={subhive} />}

            <div className="w-full flex justify-end">
              <Button
                disabled={!subhive}
                type="submit"
                className="w-full"
                form="subhive-post-form"
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
