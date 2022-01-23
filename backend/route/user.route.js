const router = require('express').Router();
const { register, login, followUser, logout, getAllUsers, getUserProfile, myAccount, updatePassword, updateProfile, deleteMyAccount } = require('../controller/user.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.post('/users/register', register);
router.post('/users/login', login);
router.get('/users/', isAuthenticated, getAllUsers); //TODO: Test
router.get('/users/:id', isAuthenticated, getUserProfile); //TODO: Test
router.get('/users/myaccount', isAuthenticated, myAccount); //TODO: Test
router.put('/users/update/profile', isAuthenticated, updateProfile);
router.put('/users/update/password', isAuthenticated, updatePassword);
router.delete('/users/delete/myaccount', isAuthenticated, deleteMyAccount); //TODO: Test
router.post('/users/logout', isAuthenticated, logout);

router.post('/users/follow/:id', isAuthenticated, followUser); //TODO: Test


const userModel = require('../models/user.model');
const postModel = require('../models/post.model');

router.delete('/user/deleteall', async (req, res) => {
    const user = await userModel.deleteMany({});

    // Logout This User
    const cookieOptions = {expires: new Date(Date.now()), httpOnly: true}
    res.cookie("token", null, cookieOptions);

    res.status(200).json({
        success: true
    })
})

router.delete('/post/deleteall', async (req, res) => {
    const post = await postModel.deleteMany({});

    res.status(200).json({
        success: true
    })
})

module.exports = router;