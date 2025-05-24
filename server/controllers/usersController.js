const { PrismaClient } = require('@prisma/client');
const { events } = require('../config/events');

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
        AND id != ${req.user.id} LIMIT 15`;
    } else {
      users = await prisma.user.findMany({
        where: {
          NOT: [{ id: req.user.id }],
        },
        take: 15,
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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
          bio: true,
          profileImageUrl: true,
          followers: true,
          following: true,
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
          posts: {
            include: {
              _count: {
                select: {
                  likedBy: true,
                },
              },
            },
            orderBy: {
              dateTime: 'desc',
            },
          },
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
          posts: {
            include: {
              _count: {
                select: {
                  likedBy: true,
                },
              },
            },
            orderBy: {
              dateTime: 'desc',
            },
          },
        },
      });
    }

    let likedByAuthUser = await prisma.post.findMany({
      where: {
        authorId: id,
        likedBy: {
          some: {
            id: req.user.id,
          },
        },
      },
    });

    likedByAuthUser = likedByAuthUser.map((likedByItem) => likedByItem.id);

    return res.json({
      ...user,
      posts: user.posts.map((post) => {
        if (likedByAuthUser.includes(post.id))
          return { ...post, likedByAuthUser: true };
        else return { ...post, likedByAuthUser: false };
      }),
    });
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

      if (follow) {
        const notification = await prisma.notification.create({
          data: {
            toUserId: followingId,
            fromUserId: req.user.id,
            type: 'FOLLOW',
          },
          include: {
            toUser: true,
            fromUser: true,
            post: true,
          },
        });

        events.emit('newNotification', { notification });
      }

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

async function updateUserProfile(req, res, next) {
  try {
    let usernameTaken;

    if (req.body.username)
      usernameTaken = await prisma.user.findFirst({
        where: {
          username: req.body.username,
        },
      });

    if (req.body.username && usernameTaken)
      return res.status(409).json({ message: 'Username is not available.' });
    else if (req.body.bio.length > 150)
      return res
        .status(400)
        .json({ message: 'Bio must not be longer than 150 characters.' });

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        firstName: req.body.firstName || undefined,
        lastName: req.body.lastName || undefined,
        username: req.body.username || undefined,
        profileImageUrl: req.body.profileImageUrl || undefined,
        bio: req.body.bio || undefined,
      },
      select: {
        firstName: true,
        lastName: true,
        username: true,
        bio: true,
        id: true,
        profileImageUrl: true,
      },
    });

    return res.json(updatedUser);
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
  updateUserProfile,
};
