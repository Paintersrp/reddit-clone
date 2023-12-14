import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CreateComment from "./CreateComment";
import CommentWithReplies from "./CommentWithReplies";

interface CommentsProps {
  threadId: string;
}

const Comments = async ({ threadId }: CommentsProps) => {
  // Get session, if available
  const session = await getAuthSession();

  // TODO - Adapt to retrieve all comments, then process their nested structure after to handle deeply nested comments and replies
  // Top level comments, with top level replies
  const comments = await db.comment.findMany({
    where: {
      threadId,
      replyToId: null,
    },
    orderBy: {
      score: "desc",
    },
    include: {
      author: true,
      votes: true,
      replies: {
        orderBy: {
          score: "desc",
        },
        include: {
          author: true,
          votes: true,
          replies: {
            orderBy: {
              score: "desc",
            },
            include: {
              author: true,
              votes: true,
              replies: {
                orderBy: {
                  score: "desc",
                },
                include: {
                  votes: true,
                  author: true,
                },
              },
            },
          },
          replyTo: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      {/* Comment Creation */}
      <CreateComment threadId={threadId} />

      {/* Comments Display */}
      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => (
            <CommentWithReplies
              key={topLevelComment.id}
              comment={topLevelComment}
              session={session}
              threadId={threadId}
            />
          ))}
      </div>
    </div>
  );
};

export default Comments;
