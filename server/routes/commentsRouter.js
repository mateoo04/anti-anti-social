const { Router } = require('express');
const {
  addComment,
  deleteComment,
  getComments,
} = require('../controllers/commentsController');

const commentsRouter = Router({ mergeParams: true });

commentsRouter.get('/', getComments);

commentsRouter.post('/', addComment);

commentsRouter.delete('/:commentId', deleteComment);

module.exports = commentsRouter;
