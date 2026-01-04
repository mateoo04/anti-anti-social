const { PrismaClient } = require("@prisma/client");

const prisma = require("../lib/prisma");

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

async function getStats(req, res) {
  try {
    const days = parsePositiveInt(req.query.days, 30);
    const safeDays = Math.min(days, 365);

    const since = new Date();
    since.setDate(since.getDate() - safeDays);

    const [
      totalUsers,
      totalPosts,
      totalComments,
      postsLastNDays,
      commentsLastNDays,
      usersCreatedLastNDays,
      usersUpdatedLastNDays,
      postLikeCounts,
      commentLikeCounts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.post.count({ where: { dateTime: { gte: since } } }),
      prisma.comment.count({ where: { dateTime: { gte: since } } }),
      prisma.user.count({ where: { createdAt: { gte: since } } }),
      prisma.user.count({ where: { updatedAt: { gte: since } } }),
      prisma.post.findMany({ select: { _count: { select: { likedBy: true } } } }),
      prisma.comment.findMany({ select: { _count: { select: { likedBy: true } } } }),
    ]);

    const totalPostLikes = postLikeCounts.reduce((sum, p) => sum + p._count.likedBy, 0);
    const totalCommentLikes = commentLikeCounts.reduce((sum, c) => sum + c._count.likedBy, 0);

    return res.json({
      rangeDays: safeDays,
      since,
      totals: {
        users: totalUsers,
        posts: totalPosts,
        comments: totalComments,
        postLikes: totalPostLikes,
        commentLikes: totalCommentLikes,
      },
      lastNDays: {
        usersCreated: usersCreatedLastNDays,
        usersUpdated: usersUpdatedLastNDays,
        posts: postsLastNDays,
        comments: commentsLastNDays,
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load stats" });
  }
}

/* async function listUsers(req, res) {
  try {
    const query = String(req.query.query ?? "").trim();
    const page = Math.max(1, parsePositiveInt(req.query.page, 1));
    const pageSize = Math.min(100, Math.max(1, parsePositiveInt(req.query.pageSize, 20)));
    const skip = (page - 1) * pageSize;

    const where = query
      ? {
          OR: [
            { username: { contains: query, mode: "insensitive" } },
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { username: "asc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
          isAdmin: true,
          isRestricted: true,
          _count: {
            select: {
              posts: true,
              comments: true,
              followers: true,
              following: true,
            },
          },
        },
      }),
    ]);

    return res.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load users" });
  }
}
 */
async function setRestricted(req, res) {
  try {
    const { userId } = req.params;
    const restricted = Boolean(req.body?.restricted);

    // Safety: don't let an admin restrict themselves
    if (req.user?.id === userId) {
      return res.status(400).json({ message: "You cannot restrict your own account." });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isRestricted: restricted },
      select: { id: true, username: true, isRestricted: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "User not found" });
  }
}

async function setAdmin(req, res) {
  try {
    const { userId } = req.params;
    const isAdmin = Boolean(req.body?.isAdmin);

    // Safety: don't let an admin remove admin from themselves
    if (req.user?.id === userId && isAdmin === false) {
      return res.status(400).json({ message: "You cannot remove admin from yourself." });
    }

    // Safety: don't allow removing the last admin
    if (isAdmin === false) {
      const adminCount = await prisma.user.count({ where: { isAdmin: true } });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "Cannot remove the last admin." });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: isAdmin, isRestricted: isAdmin ? false : undefined },
      select: { id: true, username: true, isAdmin: true },
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ message: "User not found" });
  }
}

module.exports = {
  getStats,
  setRestricted,
  setAdmin,
};
