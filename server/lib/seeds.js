const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

const { createGuestIfNotExists } = require('./guestCreate');

const prisma = require("../lib/prisma");

async function getRandomUsers(length) {
  return await Promise.all(
    Array.from({ length }).map(async () => ({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      username: faker.internet.username().toLowerCase(),
      bio: faker.person.bio(),
      profileImageUrl: faker.image.avatar(),
      password: await bcrypt.hash(faker.internet.password(), 10),
      posts: {
        create: [
          {
            content: faker.lorem.lines(2),
            photoUrl: faker.image.url(),
          },
          {
            content: faker.lorem.lines(1),
          },
        ],
      },
    }))
  );
}

async function main() {
  console.log('Seeding...');

  try {
    const users = await getRandomUsers(20);

    for (const user of users) {
      await prisma.user.create({
        data: user,
      });
    }

    createGuestIfNotExists();
  } catch (err) {
    console.log(err);
  }

  console.log('Done');
}

main();

module.exports;
