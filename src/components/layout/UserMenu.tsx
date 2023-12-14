"use client";

import { FC } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

import type { User } from "next-auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/DropdownMenu";
import UserAvatar from "../ui/UserAvatar";

interface UserMenuProps {
  user: Pick<User, "name" | "image" | "email">;
}

const UserMenu: FC<UserMenuProps> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className="h-8 w-8 mr-2 sm:mr-0 ml-1 sm:ml-0"
          user={{ name: user.name || null, image: user.image || null }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-semibold text-sm">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-zinc-700">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-sm" asChild>
          <Link href="/browse">Browse Subhives</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-sm" disabled asChild>
          <Link href="/browse">Your Subhives</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-sm" asChild>
          <Link href="/hive/all">All</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-sm" asChild>
          <Link href="/">Your Feed</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="text-sm">
          <Link href="/hive/create">Create Subhive</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-sm">
          <Link href="/submit">Create Thread</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="text-sm">
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            signOut({ callbackUrl: `${window.location.origin}/sign-in` });
          }}
          className="cursor-pointer text-sm"
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
