"use client";

import { FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/DropdownMenu";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import { Icons } from "../ui/Icons";
import { Menu } from "lucide-react";

const GuestMenu: FC = () => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="sm:h-8 sm:w-8 h-9 w-9 mr-2 sm:mr-0 ml-1 sm:ml-0 focus:border-none focus:outline-none ring-0">
          <AvatarFallback className="bg-zinc-200">
            <span className="sr-only">Guest</span>
            <Menu className="sm:h-4 sm:w-4 h-5 w-5 text-zinc-800" />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-semibold text-sm">Welcome to Hivemind</p>
            <p className="w-[200px] truncate text-sm text-zinc-700">
              You are not logged in
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-sm" asChild>
          <Link href="/">Home</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-sm" asChild>
          <Link href="/all">All</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            router.push("/sign-in");
          }}
          className="cursor-pointer text-sm"
        >
          Sign In
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            router.push("/sign-up");
          }}
          className="cursor-pointer text-sm"
        >
          Register
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default GuestMenu;
