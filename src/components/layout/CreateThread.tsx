"use client";

import type { Session } from "next-auth";

import { FC, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ImageIcon, Link2 } from "lucide-react";

import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import UserAvatar from "../ui/UserAvatar";

interface CreateThreadProps {
  session: Session | null;
}

const CreateThread: FC<CreateThreadProps> = ({ session }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [path, setPath] = useState(pathname);

  useEffect(() => {
    if (pathname === "/" || pathname === "/hive/all") {
      setPath("");
    } else {
      setPath(pathname);
    }
  }, [pathname]);

  return (
    <div className="overflow-hidden sm:rounded-md mb-0 sm:mb-4 bg-white shadow sm:border-0 border-b border-zinc-200">
      <div className="h-full px-2 sm:px-6 py-2 sm:py-4 flex flex-row justify-between items-center gap-3 md:gap-6">
        {session?.user && (
          <div className="relative mr-1">
            <UserAvatar
              className="h-8 w-8 sm:h-10 sm:w-10"
              user={{
                name: session?.user.name || null,
                image: session?.user.image || null,
              }}
            />

            <span className="absolute bottom-0 right-0 rounded-full w-2 h-2 sm:w-3 sm:h-3 bg-green-500 outline outline-2 outline-white" />
          </div>
        )}
        <Input
          onClick={() => router.push(path + "/submit")}
          readOnly
          placeholder="Create thread"
        />

        <Button
          onClick={() => router.push(path + "/submit")}
          variant="ghost"
          size="sm"
        >
          <ImageIcon className="text-zinc-600" />
        </Button>

        <Button
          onClick={() => router.push(path + "/submit")}
          variant="ghost"
          size="sm"
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </div>
  );
};

export default CreateThread;
