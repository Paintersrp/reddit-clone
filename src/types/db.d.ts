import {
  Comment,
  CommentVote,
  Subhive,
  Thread,
  User,
  Vote,
} from "@prisma/client";

export type ExtendedThread = Thread & {
  subhive: Subhive;
  votes: Vote[];
  author: User;
  comments: Comment[];
  _count: Prisma.ThreadCountOutputType;
};

export type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

export type JoinedThread = Thread & {
  author: User;
  votes: Vote[];
  _count: Prisma.ThreadCountOutputType;
};
