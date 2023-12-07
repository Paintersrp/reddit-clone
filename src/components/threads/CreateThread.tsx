"use client";

import { FC } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Session } from "next-auth";
import UserAvatar from "../ui/UserAvatar";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ImageIcon, Link2 } from "lucide-react";

interface CreateThreadProps {
  session: Session | null;
}

const CreateThread: FC<CreateThreadProps> = ({ session }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="overflow-hidden rounded-md bg-white shadow">
      <div className="h-full px-6 py-4 flex justify-between gap-6 flex-wrap md:flex-nowrap">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />

          <span className="absolute bottom-0 right-0 rounded-full w-3 h-3 bg-green-500 outline outline-2 outline-white" />
        </div>
        <Input
          onClick={() => router.push(pathname + "/submit")}
          readOnly
          placeholder="Create thread"
        />
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <ImageIcon className="text-zinc-600" />
        </Button>
        <Button
          onClick={() => router.push(pathname + "/submit")}
          variant="ghost"
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </div>
  );
};

export default CreateThread;
