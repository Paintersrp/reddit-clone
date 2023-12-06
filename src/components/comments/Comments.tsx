import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { tallyVoteScore } from "@/lib/votes";
import Comment from "./Comment";
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
      {/* <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = tallyVoteScore(topLevelComment);

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <Comment
                    threadId={threadId}
                    votesAmt={topLevelCommentVotesAmt}
                    currentVote={topLevelCommentVote}
                    comment={topLevelComment}
                  />
                </div>        
                {topLevelComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVotesAmt = tallyVoteScore(reply);

                    const replyVote = reply.votes.find(
                      (vote) => vote.userId === session?.user.id
                    );

                    return (
                      <div key={reply.id}>
                        <div className="ml-2 py-2 pl-4 border-l-2 border-zinc-200">
                          <Comment
                            threadId={threadId}
                            votesAmt={replyVotesAmt}
                            currentVote={replyVote}
                            comment={reply}
                          />

                          {reply.replies
                            .sort((a, b) => b.votes.length - a.votes.length)
                            .map((reply) => {
                              const replyVotesAmt = tallyVoteScore(reply);

                              const replyVote = reply.votes.find(
                                (vote) => vote.userId === session?.user.id
                              );

                              return (
                                <div
                                  key={reply.id}
                                  className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                                >
                                  <Comment
                                    threadId={threadId}
                                    votesAmt={replyVotesAmt}
                                    currentVote={replyVote}
                                    comment={reply}
                                  />
                                  subreply
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div> */}
    </div>
  );
};

export default Comments;
