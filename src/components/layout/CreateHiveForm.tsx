"use client";

import type { Session } from "next-auth";

import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { FC } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

import { useAuthToast } from "@/hooks/use-auth-toast";
import { toast } from "@/hooks/use-toast";
import {
  CreateSubhivePayload,
  SubhiveValidator,
} from "@/lib/validators/subhive";
import { useSession } from "next-auth/react";

interface CreateHiveFormProps {
  // Add your prop types here
}

const CreateHiveForm: FC<CreateHiveFormProps> = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { loginToast } = useAuthToast();

  const {
    watch,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CreateSubhivePayload>({
    resolver: zodResolver(SubhiveValidator),
    defaultValues: {
      name: "",
    },
  });

  // Returns mutation function (renamed createHive) and loading state
  const { mutate: createHive, isLoading } = useMutation({
    // Create Subhive
    mutationFn: async ({ name }: CreateSubhivePayload) => {
      const payload: CreateSubhivePayload = {
        name,
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

      return toast({
        title: "Subhive created!",
        description: `/hive/${data} has been created.`,
      });
    },
  });

  return (
    <form
      onSubmit={handleSubmit((e) => {
        // If no session.user, we return a toast with a login prompt
        if (!session?.user) return loginToast();
        createHive(e);
      })}
    >
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Enter subhive name
          </CardTitle>
          <CardDescription>
            Community names including capitalization cannot be changed
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">h/</span>
            </div>

            <Label className="sr-only" htmlFor="name">
              Subhive name
            </Label>
            <Input
              id="name"
              className="w-full max-w-[400px] pl-6"
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end gap-2">
            <Button
              isLoading={isLoading}
              disabled={!watch("name")}
              type="submit"
            >
              Create Hive
            </Button>
            <Button variant="subtle" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CreateHiveForm;
