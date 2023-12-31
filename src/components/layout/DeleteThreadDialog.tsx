"use client";

import { FC, useState } from "react";
import { Trash } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios from "axios";

import { DeleteThreadRequest } from "@/lib/validators/delete-thread";
import { Button } from "../ui/Button";
import { toast } from "@/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../ui/Dialog";

interface DeleteThreadDialogProps {
  threadId: string;
}

const DeleteThreadDialog: FC<DeleteThreadDialogProps> = ({ threadId }) => {
  // Setup router for success navigation
  const router = useRouter();

  // Boolean state for determining whether to display the dialog element
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Toggles boolean state for dialog visibility
  const deleteClick = () => {
    setIsDeleting(!isDeleting);
  };

  const deleteMutate = async ({ threadId }: DeleteThreadRequest) => {
    // Sets up thread deletion payload and sends it to the deletion endpoint
    const payload: DeleteThreadRequest = {
      threadId,
    };

    const { data } = await axios.patch("/api/subhive/thread/delete", payload);

    return data;
  };

  // Handles errors with a generic error toast
  const deleteError = () => {
    return toast({
      title: "There was a problem.",
      description: "Something went wrong, please try again.",
      variant: "destructive",
    });
  };

  // On successful delete, we refresh the router and reset state
  const deleteSuccess = () => {
    router.refresh();
    setIsDeleting(false);
  };

  const { mutate: deleteThread, isLoading: deleteLoading } = useMutation({
    mutationFn: deleteMutate,
    onError: deleteError,
    onSuccess: deleteSuccess,
  });

  return (
    <Dialog>
      <DialogTrigger
        onClick={deleteClick}
        className="relative top-0 right justify-end bg-red-500 hover:bg-red-600 p-1 text-white rounded"
      >
        <Trash className="h-4 w-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            thread content and remove the data from our servers. The thread and
            comments will remain.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 justify-end md:justify-end">
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="text-red-600 border border-red-600 hover:text-white transition-colors duration-200 ease-out font-semibold focus:ring-red-400 focus:outline-none focus:ring-2 focus:border-none"
              variant="destructive"
              isLoading={deleteLoading}
              onClick={() => deleteThread({ threadId })}
              type="button"
              autoFocus
            >
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteThreadDialog;
