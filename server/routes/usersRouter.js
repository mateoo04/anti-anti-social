const { Router } = require('express');
const {
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  removeFollower,
} = require('../controllers/usersController');

const usersRouter = Router();

usersRouter.get('/', getAllUsers);
usersRouter.get('/:userId', getUserById);

usersRouter.post('/:userId/follow', followUser);

usersRouter.delete('/:userId/unfollow', unfollowUser);
usersRouter.delete('/:userId/remove-follower', removeFollower);

module.exports = usersRouter;
