import { Comment, Subhive, Thread, User, Vote } from "@prisma/client";

export type ExtendedThreads = Thread & {
  subhive: Subhive;
  votes: Vote[];
  author: User;
  comments: Comment[];
};


