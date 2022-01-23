const router = require('express').Router();
const { createPost, likeAndUnlikePost, deletePost, getPostofFollowing, updatePostCaption } = require('../controller/post.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.post('/posts', isAuthenticated, createPost);
router.get('/posts', isAuthenticated, getPostofFollowing);
router.put('/posts/:id', isAuthenticated, updatePostCaption); // TODO: Test this
router.delete('/posts/:id', isAuthenticated, deletePost);

router.post('/posts/like/:id', isAuthenticated, likeAndUnlikePost);

module.exports = router;