const EventEmitter = require('events');
const events = new EventEmitter();

let ioInstance;

const setUpSocketEvents = (io) => {
  ioInstance = io;

  events.on('newNotification', ({ notification }) => {
    if (!ioInstance) return;

    ioInstance
      .to(`notifs-${notification.toUserId}`)
      .emit('newNotification', notification);
  });
};

module.exports = { events, setUpSocketEvents };
