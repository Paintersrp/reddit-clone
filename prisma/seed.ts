/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const tallyVoteScore = (content: any) => {
  return content.votes.reduce((acc: any, vote: any) => {
    if (vote.type === "UP") return acc + 1;
    if (vote.type === "DOWN") return acc - 1;
    return acc;
  }, 0);
};

async function seedThreadVotes(users: any) {
  const threads = await prisma.thread.findMany();
  const totalUsers = users.length;

  for (let i = 0; i < totalUsers; i++) {
    const user = users[i];
    console.log(
      `Processing thread votes for user ${i + 1}/${totalUsers} (${user.id})`
    );

    for (const thread of threads) {
      const voteType = Math.random() < 0.8 ? "UP" : "DOWN";

      const existingVote = await prisma.vote.findFirst({
        where: {
          userId: user.id,
          threadId: thread.id,
        },
      });

      if (!existingVote) {
        await prisma.vote.create({
          data: {
            userId: user.id,
            threadId: thread.id,
            type: voteType,
          },
        });

        const threadAfterUpdate = await prisma.thread.findFirst({
          where: { id: thread.id },
          include: { votes: true },
        });

        const score = tallyVoteScore(threadAfterUpdate);

        await prisma.thread.update({
          where: {
            id: thread.id,
          },
          data: {
            score,
          },
        });
      }
    }
  }
}

async function seedCommentVotes(users: any) {
  const comments = await prisma.comment.findMany();
  const totalUsers = users.length;

  for (let i = 0; i < totalUsers; i++) {
    const user = users[i];
    console.log(
      `Processing comment votes for user ${i + 1}/${totalUsers} (${user.id})`
    );

    for (let j = 0; j < comments.length; j++) {
      const comment = comments[j];
      const voteType = Math.random() < 0.8 ? "UP" : "DOWN";

      if (j % 10 === 0) {
        console.log(
          `--> User ${i + 1}: Processing comment ${j + 1}/${comments.length}`
        );
      }

      const existingVote = await prisma.commentVote.findFirst({
        where: {
          userId: user.id,
          commentId: comment.id,
        },
      });

      if (!existingVote) {
        await prisma.commentVote.create({
          data: {
            userId: user.id,
            commentId: comment.id,
            type: voteType,
          },
        });

        const commentAfterUpdate = await prisma.comment.findFirst({
          where: { id: comment.id },
          include: { votes: true },
        });

        const score = tallyVoteScore(commentAfterUpdate);

        await prisma.comment.update({
          where: {
            id: comment.id,
          },
          data: {
            score,
          },
        });
      }
    }
  }
}

async function load() {
  const users = await prisma.user.findMany();
  console.log(`Loaded ${users.length} users`);

  // Check if users are available to proceed with voting
  if (users.length > 0) {
    // Seed other entities based on the users
    await seedThreadVotes(users);
    console.log("Thread Votes Seeded");

    await seedCommentVotes(users);
    console.log("Comment Votes Seeded");
  } else {
    console.log("No users found. Seed users first before seeding votes.");
  }
}

load()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
