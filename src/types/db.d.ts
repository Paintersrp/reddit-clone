import {
  Comment,
  CommentVote,
  Subhive,
  Thread,
  User,
  Vote,
} from "@prisma/client";

export type ExtendedThreads = Thread & {
  subhive: Subhive;
  votes: Vote[];
  author: User;
  comments: Comment[];
};

export type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

export type JoinedThread = Thread & {
  author: User;
  votes: Vote[];
};
