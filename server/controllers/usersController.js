const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAllUsers(req, res, next) {
  try {
    let users = [];
    if (req.query.search) {
      const search = req.query.search.toLowerCase();

      users = await prisma.$queryRaw`
        SELECT * FROM "User"
        WHERE (LOWER(CONCAT("firstName", ' ', "lastName")) LIKE ${
          '%' + search + '%'
        }
        OR username LIKE ${'%' + search + '%'})
        AND id != ${req.user.id}`;
    } else {
      users = await prisma.user.findMany({
        where: {
          NOT: [{ id: req.user.id }],
        },
      });
    }

    return res.json(users);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = req.params.userId;
    let user = {};

    if (req.query.includeFollows) {
      user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
          following: {
            include: {
              following: true,
            },
          },
          followers: {
            include: {
              follower: true,
            },
          },
          posts: true,
        },
      });

      user = {
        ...user,
        following: user.following.map((item) => item.following),
        followers: user.followers.map((item) => item.follower),
      };
    } else {
      user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
          posts: true,
        },
      });
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
}

async function followUser(req, res, next) {
  try {
    const followingId = req.params.userId;

    const isFollowing = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId,
        },
      },
    });

    if (isFollowing)
      return res
        .status(409)
        .json({ message: 'You are already following this user' });
    else {
      const follow = await prisma.follows.create({
        data: {
          followerId: req.user.id,
          followingId,
        },
      });

      return res.status(201).json({ message: 'User followed', follow });
    }
  } catch (err) {
    next(err);
  }
}

async function unfollowUser(req, res, next) {
  try {
    const followingId = req.params.userId;

    const isFollowing = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId,
        },
      },
    });

    if (!isFollowing)
      return res
        .status(400)
        .json({ message: 'You are not following this user' });

    const unfollow = await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId,
        },
      },
    });

    return res.json({ message: 'User unfollowed', unfollow });
  } catch (err) {
    next(err);
  }
}

async function removeFollower(req, res, next) {
  try {
    const followerId = req.params.userId;

    const isFollowing = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: req.user.id,
        },
      },
    });

    if (!isFollowing)
      return res
        .status(400)
        .json({ message: 'This user is not following you' });

    const unfollow = await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: req.user.id,
        },
      },
    });

    return res.json({ message: 'Removed follower', unfollow });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  removeFollower,
};
