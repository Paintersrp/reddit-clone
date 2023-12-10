/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function load() {
  const users = await seedUsers(20);
  console.log("Users Seeded");

  await seedSubhives(20, users);
  console.log("Subhives Seeded");

  await seedThreads(50, users);
  console.log("Threads Seeded");

  await seedComments(75, users);
  console.log("Comments Seeded");
}

async function seedUsers(count: number) {
  let users = [];
  for (let i = 0; i < count; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        username: faker.internet.userName(),
      },
    });
    users.push(user);
  }
  return users;
}

async function seedSubhives(count: number, users: any[]): Promise<void> {
  const generatedNames = new Set<string>();
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);
    let uniqueName = faker.word.sample();

    // Ensure uniqueness of the name
    while (generatedNames.has(uniqueName)) {
      uniqueName = faker.word.sample();
    }

    generatedNames.add(uniqueName);

    await prisma.subhive.create({
      data: {
        name: uniqueName,
        creatorId: user.id,
      },
    });
  }
}

const codeSnippets = [
  `const x = ${faker.number.int()};`,
  `let y = '${faker.lorem.word()}';`,
  `function myFunc() { return ${faker.datatype.boolean()}; }`,
  `if (${faker.datatype.boolean()}) { console.log('${faker.lorem.sentence()}'); }`,
  `const arr = [${faker.word.sample()}, ${faker.word.sample()}];`,
];

// Seed Threads
async function seedThreads(count: number, users: any[]): Promise<void> {
  const subhives = await prisma.subhive.findMany();
  const codeBlocks = faker.helpers.shuffle(codeSnippets);

  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);
    const subhive = faker.helpers.arrayElement(subhives);

    const blocks: any = [
      {
        type: "paragraph",
        data: {
          text: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
        },
      },
    ];

    if (i < codeBlocks.length) {
      blocks.push({
        type: "code",
        data: {
          code: codeBlocks[i],
        },
      });
    }

    const blockTypes = ["list", "linkTool"];
    const selectedBlockTypes = faker.helpers
      .shuffle(blockTypes)
      .slice(0, faker.number.int({ min: 1, max: blockTypes.length }));

    for (const type of selectedBlockTypes) {
      switch (type) {
        case "list":
          blocks.push({
            type: "list",
            data: {
              style: "ordered",
              items: [
                faker.commerce.productName(),
                faker.commerce.productName(),
                faker.commerce.productName(),
              ],
            },
          });
          break;
        case "linkTool":
          blocks.push({
            type: "linkTool",
            data: {
              link: faker.internet.url(),
              meta: {
                title: faker.company.catchPhrase(),
                description: faker.lorem.sentence(),
              },
            },
          });
          break;
      }
    }

    const content = {
      time: new Date().getTime(),
      blocks: blocks,
      version: "2.27.0",
    };

    await prisma.thread.create({
      data: {
        title: faker.company.buzzVerb(),
        content: content,
        subhiveId: subhive.id,
        authorId: user.id,
      },
    });
  }
}

// Seed Comments and Nested Comments
async function seedComments(count: number, users: any[]): Promise<void> {
  const threads = await prisma.thread.findMany();
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);
    const thread = faker.helpers.arrayElement(threads);
    let parentCommentId: string | null = null;

    // Create a chain of nested comments
    for (let j = 0; j < faker.number.int({ min: 1, max: 5 }); j++) {
      // Nested up to 5 levels
      const comment: any = await prisma.comment.create({
        data: {
          text: faker.lorem.sentences(2),
          threadId: thread.id,
          authorId: user.id,
          replyToId: parentCommentId,
        },
      });

      parentCommentId = comment.id; // The next comment will reply to this one
    }
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
