const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createGuestIfNotExists() {
  const select = {
    id: true,
    firstName: true,
    lastName: true,
    bio: true,
    username: true,
    profileImageUrl: true,
    followers: {
      select: {
        followerId: true,
      },
    },
    following: {
      select: {
        followingId: true,
      },
    },
  };

  let guest = await prisma.user.findFirst({
    where: { username: 'jan_rolf' },
    select,
  });

  if (!guest) {
    const password = await bcrypt.hash(faker.internet.password(), 10);

    guest = await prisma.user.create({
      data: {
        username: 'jan_rolf',
        firstName: 'Jan',
        lastName: 'Rolf',
        password: password,
        bio: 'Guest user',
      },
      select,
    });
  }

  return guest;
}

module.exports = { createGuestIfNotExists };
