const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getComments(req, res, next) {
  try {
    const postId = req.params.postId;

    const [comments, likedByAuthUser] = await Promise.all([
      prisma.comment.findMany({
        where: {
          postId,
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
          likedBy: {
            _count: 'desc',
          },
        },
      }),
      prisma.comment.findMany({
        where: {
          postId,
          likedBy: {
            some: {
              id: req.user.id,
            },
          },
        },
      }),
    ]);

    const likedByAuthUserIds = likedByAuthUser.map((item) => item.id);

    return res.json(
      comments.map((comment) => {
        if (likedByAuthUserIds.includes(comment.id))
          return { ...comment, likedByAuthUser: true };
        else return { ...comment, likedByAuthUser: false };
      })
    );
  } catch (err) {
    next(err);
  }
}

async function addComment(req, res, next) {
  try {
    const postId = req.params.postId;
    const content = req.body.content;

    const comment = await prisma.comment.create({
      data: {
        postId,
        content,
        authorId: req.user.id,
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
        post: {
          select: {
            authorId: true,
          },
        },
      },
    });

    await prisma.notification.create({
      data: {
        fromUserId: req.user.id,
        toUserId: comment.post.authorId,
        postId,
        type: 'COMMENT',
      },
    });

    return res.status(201).send(comment);
  } catch (err) {
    next(err);
  }
}

async function deleteComment(req, res, next) {
  try {
    const id = req.params.commentId;

    const comment = await prisma.comment.delete({
      where: {
        id,
      },
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function likeComment(req, res, next) {
  try {
    const commentId = req.params.commentId;

    const likedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        likedBy: {
          connect: {
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

async function unlikeComment(req, res, next) {
  try {
    const commentId = req.params.commentId;

    const unlikedComment = await prisma.comment.update({
      where: {
        id: commentId,
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

module.exports = {
  getComments,
  addComment,
  deleteComment,
  likeComment,
  unlikeComment,
};
