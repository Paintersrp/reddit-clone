import { FC } from "react";
import { Icons } from "../ui/Icons";
import Link from "next/link";
import AuthForm from "./AuthForm";

// Sign In / Sign Up left as separate components for future proofing
const SignUp: FC = ({}) => {
  return (
    <div className="container mx-auto flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.Logo className="mx-auto h-7 w-7" />
        <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up an account and agree to our User
          Agreeement and Privacy Policy.
        </p>

        {/* Form */}
        <AuthForm />

        <p className="px-8 text-center text-sm text-zinc-700">
          Already a Hiveminder? {"  "}
          <Link
            href="/sign-in"
            className="hover:text-zinc-800 text-sm underline underline-offset-4"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
