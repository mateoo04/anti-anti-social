const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getPosts(req, res, next) {
  try {
    const [posts, likedBy] = await Promise.all([
      prisma.post.findMany({
        where: {
          author: {
            followers: {
              some: {
                followerId: req.user.id,
              },
            },
          },
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              likedBy: true,
            },
          },
        },
        orderBy: {
          dateTime: 'desc',
        },
      }),
      prisma.post.findMany({
        where: {
          author: {
            followers: {
              some: {
                followerId: req.user.id,
              },
            },
          },
          likedBy: {
            some: {
              id: req.user.id,
            },
          },
        },
      }),
    ]);

    const likedByAuthUser = likedBy.map((likedByItem) => likedByItem.id);

    return res.json(
      posts.map((post) => {
        if (likedByAuthUser.includes(post.id))
          return { ...post, likedByAuthUser: true };
        else return { ...post, likedByAuthUser: false };
      })
    );
  } catch (err) {
    next(err);
  }
}

async function getPostById(req, res, next) {
  try {
    const postId = req.params.postId;

    const [post, liked] = await Promise.all([
      prisma.post.findUnique({
        where: {
          id: postId,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              profileImageUrl: true,
            },
          },
          _count: {
            select: {
              likedBy: true,
            },
          },
        },
      }),
      prisma.post.findFirst({
        where: {
          id: postId,
          likedBy: {
            some: {
              id: req.user.id,
            },
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    return res.json({
      ...post,
      likedByAuthUser: Boolean(liked),
    });
  } catch (err) {
    next(err);
  }
}

async function createNewPost(req, res, next) {
  try {
    const post = await prisma.post.create({
      data: {
        content: req.body.content || undefined,
        photoUrl: req.body.photoUrl || undefined,
        authorId: req.user.id,
      },
    });

    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
}

async function likePost(req, res, next) {
  try {
    const postId = req.params.postId;

    const likedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedBy: {
          connect: {
            id: req.user.id,
          },
        },
      },
      select: {
        authorId: true,
        id: true,
      },
    });

    const exists = await prisma.notification.findFirst({
      where: {
        type: 'LIKE',
        fromUserId: req.user.id,
        toUserId: likedPost.authorId,
        postId: likedPost.id,
      },
    });

    if (!exists) {
      await prisma.notification.create({
        data: {
          type: 'LIKE',
          fromUserId: req.user.id,
          toUserId: likedPost.authorId,
          postId: likedPost.id,
        },
      });
    }

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function unlikePost(req, res, next) {
  try {
    const postId = req.params.postId;

    const unlikedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        likedBy: {
          disconnect: {
            id: req.user.id,
          },
        },
      },
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function deletePost(req, res, next) {
  try {
    const postId = req.params.postId;

    validatePostAuthor(req, res, postId);

    await prisma.comment.deleteMany({
      where: {
        postId,
      },
    });

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
}

async function updatePost(req, res, next) {
  try {
    const postId = req.params.postId;

    validatePostAuthor(req, res, postId);

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        content: req.body.content || undefined,
        photoUrl: req.body.photoUrl || undefined,
      },
    });

    return res.json(updatedPost);
  } catch (err) {
    next(err);
  }
}

async function validatePostAuthor(req, res, postId) {
  const isAuthor = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId: req.user.id,
    },
  });

  if (!isAuthor) res.status(403);
}

module.exports = {
  createNewPost,
  getPostById,
  getPosts,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
};
