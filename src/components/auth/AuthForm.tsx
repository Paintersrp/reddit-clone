"use client";

import { signIn } from "next-auth/react";
import { FC, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icons } from "@/components/ui/Icons";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const AuthForm: FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...rest
}) => {
  // Boolean state for manually determining loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hook returns function for rendering toast elements
  const { toast } = useToast();

  // Functions to allow user to log in using Google Provider
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
      setIsLoading(false);
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
