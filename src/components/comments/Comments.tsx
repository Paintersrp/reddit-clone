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

  // Top level comments, with top level replies
  const comments = await db.comment.findMany({
    where: {
      threadId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,

      replies: {
        include: {
          author: true,
          votes: true,
          replies: {
            include: {
              author: true,
              votes: true,
              replies: {
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

      {/* Comments Section */}
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
