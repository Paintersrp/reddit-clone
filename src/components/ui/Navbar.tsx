import Link from "next/link";
import React from "react";

import { Icons } from "./Icons";
import { buttonVariants } from "./Button";
import { getAuthSession } from "@/lib/auth";
import UserMenu from "../layout/UserMenu";
import SearchBar from "./SearchBar";
import GuestMenu from "../layout/GuestMenu";

export const Navbar = async ({}) => {
  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 h-fit min-h-[50px] bg-zinc-100 border-b border-zinc-300 z-[10] py-2">
      <div className="sm:container max-w-7xl xl:max-w-[1600px] h-full mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex gap-2 items-center ml-2 sm:ml-0 mr-1 sm:mr-0"
        >
          <Icons.Logo className="h-8 w-8 sm:h-7 sm:w-7" />
          <p className="hidden text-zinc-700 text-base font-semibold md:block">
            Hivemind
          </p>
        </Link>

        {/* Search */}
        <SearchBar />

        {session?.user ? <UserMenu user={session.user} /> : <GuestMenu />}
      </div>
    </div>
  );
};

export default Navbar;
