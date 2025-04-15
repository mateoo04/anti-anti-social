const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getNotifications(req, res, next) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        toUserId: req.user.id,
      },
      include: {
        toUser: true,
        fromUser: true,
        post: true,
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    return res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function markNotificationsRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: {
        toUserId: req.user.id,
      },
      data: {
        isRead: true,
      },
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { getNotifications, markNotificationsRead };
