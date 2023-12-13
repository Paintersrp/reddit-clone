import { FC } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import SignIn from "@/components/auth/SignIn";
import { ChevronLeft } from "lucide-react";

const Page: FC = ({}) => {
  return (
    <div className="absolute inset-0 p-2">
      <div className="h-full max-w-2xl flex flex-col items-center pt-36">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "self-start -mt-20 "
          )}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Home
        </Link>

        <SignIn />
      </div>
    </div>
  );
};

export default Page;
