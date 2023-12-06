"use client";

import { FC, startTransition } from "react";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { SubscribeToSubhivePayload } from "@/lib/validators/subscribe";
import { useAuthToast } from "@/hooks/use-auth-toast";
import { toast } from "@/hooks/use-toast";
import { Button } from "../ui/Button";

interface SubscribeLeaveToggleProps {
  subhiveId: string;
  subhiveName: string;
  isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
  subhiveId,
  subhiveName,
  isSubscribed,
}) => {
  const { loginToast } = useAuthToast();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubhivePayload = {
        subhiveId,
      };

      const { data } = await axios.post("/api/subhive/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem.",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      toast({
        title: "Subscribed!",
        description: `You are now subscribed to hive/${subhiveName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnsubscribing } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubhivePayload = {
        subhiveId,
      };

      const { data } = await axios.post("/api/subhive/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem.",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      toast({
        title: "Unsubscribed!",
        description: `You are now unsubscribed to hive/${subhiveName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      isLoading={isUnsubscribing}
      onClick={() => unsubscribe()}
      className="w-full mt-1 mb-4"
    >
      Leave hive
    </Button>
  ) : (
    <Button
      isLoading={isSubscribing}
      onClick={() => subscribe()}
      className="w-full mt-1 mb-4"
    >
      Join hive to post
    </Button>
  );
};

export default SubscribeLeaveToggle;
