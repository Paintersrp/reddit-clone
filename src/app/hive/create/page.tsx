"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CreateSubhivePayload } from "@/lib/validators/subhive";
import { toast } from "@/hooks/use-toast";
import { useAuthToast } from "@/hooks/use-auth-toast";

const Page = () => {
  const router = useRouter();
  const { loginToast } = useAuthToast();

  const [input, setInput] = useState<string>("");

  // Returns mutation function (renamed createHive) and loading state
  const { mutate: createHive, isLoading } = useMutation({
    // Create Subhive
    mutationFn: async () => {
      const payload: CreateSubhivePayload = {
        name: input,
      };

      const { data } = await axios.post("/api/subhive", payload);

      return data as string;
    },

    // Error Handling
    onError: (err) => {
      if (err instanceof AxiosError) {
        // Subhive exists error
        if (err.response?.status === 409) {
          return toast({
            title: "Subhive already exists.",
            description: "Please choose a different subhive name.",
            variant: "destructive",
          });
        }

        // Subhive name doesn't match validation error
        if (err.response?.status === 422) {
          return toast({
            title: "Invalid subhive name.",
            description: "Please choose a name between 3-21 characters.",
            variant: "destructive",
          });
        }

        // Not logged in error
        if (err.response?.status === 401) {
          return loginToast();
        }

        // Unknown Error
        toast({
          title: "There was a problem",
          description: "Could not create subhive.",
          variant: "destructive",
        });
      }
    },
    onSuccess: (data) => {
      router.push(`/hive/${data}`);
    },
  });

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a hive</h1>
        </div>

        <hr className="bg-zinc-500 h-px" />

        <div>
          <p className="text-lg font-medium">Name</p>
          <p className="text-xs pb-2">
            Community names including capitalization cannot be changed
          </p>

          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              h/
            </p>
            <Input
              className="pl-6"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="subtle" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => createHive()}
          >
            Create Hive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
