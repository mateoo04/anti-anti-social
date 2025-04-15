const { Router } = require('express');
const {
  getNotifications,
  markNotificationsRead,
} = require('../controllers/notificationsController');

const notificationsRouter = new Router();

notificationsRouter.get('/', getNotifications);

notificationsRouter.post('/mark-read', markNotificationsRead);

module.exports = { notificationsRouter };
