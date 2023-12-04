import Link from "next/link";
import React from "react";

import { Icons } from "./Icons";
import { buttonVariants } from "./Button";
import { getAuthSession } from "@/lib/auth";
import UserMenu from "../UserMenu";

export const Navbar = async ({}) => {
  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 h-fit min-h-[50px] bg-zinc-100 border-b border-zinc-300 z-[10] py-2">
      <div className="container max-w-7xl xl:max-w-[1600px] h-full mx-auto flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/" className="flex gap-2 items-center">
          <Icons.Logo className="h-8 w-8 sm:h-7 sm:w-7" />
          <p className="hidden text-zinc-700 text-base font-semibold md:block">
            Hivemind
          </p>
        </Link>

        {/* Search */}

        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <div className="flex gap-2">
            <Link href="/sign-in" className={buttonVariants()}>
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className={buttonVariants({ variant: "outline" })}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
