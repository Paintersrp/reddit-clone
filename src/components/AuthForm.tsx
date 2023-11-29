"use client";

import { FC, useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "./ui/Button";
import { Icons } from "./ui/Icons";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const AuthForm: FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast({
        title: "There was a problem.",
        description: "Error logging in",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  return (
    <div className={cn("flex justify-center", className)} {...rest}>
      <Button
        onClick={loginWithGoogle}
        size="sm"
        isLoading={isLoading}
        className="w-full"
      >
        {isLoading ? null : <Icons.Google className="h-4 w-4 mr-2" />}
        Google
      </Button>
    </div>
  );
};

export default AuthForm;
