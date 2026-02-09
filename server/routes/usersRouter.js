const { Router } = require('express');
const { requireNotRestricted} = require('../middleware/requireNotRestricted');
const {
  getAllUsers,
  getUserById,
  followUser,
  unfollowUser,
  removeFollower,
  updateUserProfile,
    deleteAccount,
} = require('../controllers/usersController');

const usersRouter = Router();

usersRouter.get('/', getAllUsers);
usersRouter.get('/:userId', getUserById);

usersRouter.put('/', requireNotRestricted, updateUserProfile);

usersRouter.post('/:userId/follow', requireNotRestricted, followUser);

usersRouter.delete('/:userId/unfollow', requireNotRestricted, unfollowUser);
usersRouter.delete('/:userId/remove-follower', requireNotRestricted, removeFollower);

usersRouter.delete('/delete-account', deleteAccount);

module.exports = usersRouter;
