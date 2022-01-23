const User = require('../models/user.model');
const Post = require('../models/post.model');

module.exports = { 
                    register, login, getAllUsers, getUserProfile, followUser, myAccount, 
                    updateProfile, updatePassword, deleteMyAccount, logout
                };

async function register(req, res) {
    try {

        const { name, email, password } = req.body;
        console.log(req.body)

        let user = await User.findOne({email});

        if(user) return res.status(409).json({ success: false, message: "User Already Exists", result: null });

        user = await User.create({ name, email, password, avatar: { public_id: "http", url: "http"} });

        const token = await user.generateToken(user);
        const cookieOptions = {expires: new Date(Date.now() + 90*24*60*60*1000), httpOnly: true}

        res.status(201).cookie("token", token, cookieOptions).json({
            success: true,
            message: "Successfully Registered",
            result: { user, token }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}

async function login(req, res) {
    try {

        const { email, password } = req.body;

        let user = await User.findOne({email}).select('+password');

        if(!user) return res.status(400).json({ success: false, message: "Invalid Credentials", result: null });
        
        const isPasswordMatch = await user.matchPassword(password);

        if(!isPasswordMatch) return res.status(400).json({ success: false, message: "Invalid Credentials", result: null });

        const token = await user.generateToken(user);
        const cookieOptions = {expires: new Date(Date.now() + 90*24*60*60*1000), httpOnly: true}

        res.status(200).cookie("token", token, cookieOptions).json({
            success: true,
            message: "Successfully Login",
            result: { user, token }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}

async function getAllUsers(req, res, next) {
    try {
        const users = await User.find({})

        if(users.length < 1) return res.status(404).json({ success: false, message: "Not Found", result: null });

        res.status(200).json({
            success: true,
            message: "Successfully Fetched",
            result: users
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}


async function getUserProfile(req, res, next) {
    try {
        const user = await User.findById(req.params.id).populate('posts');

        if(!user) return res.status(404).json({ success: false, message: "Not Found", result: null });

        res.status(200).json({
            success: true,
            message: "Successfully Fetched",
            result: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}


async function followUser(req, res) {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.user._id);

        if(req.params._id === req.user._id) return res.status(400).json({ success: false, message: "Bad Request", result: null });

        if(!userToFollow) return res.status(404).json({ success: false, message: "Not Found", result: null });

        if(loggedInUser.following.includes(userToFollow._id)){
            const indexForFollowing = loggedInUser.following.indexOf(userToFollow._id);
            loggedInUser.following.splice(indexForFollowing, 1);
            
            const indexForFollowers = userToFollow.followers.indexOf(loggedInUser._id);
            userToFollow.followers.splice(indexForFollowers, 1);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "Successfully User Unfollowed",
                result: userToFollow
            });
        } else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            res.status(200).json({
                success: true,
                message: "Successfully User Followed",
                result: userToFollow
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}


async function myAccount(req, res, next) {
    try {
        const user = await User.findById(req.user._id).populate('posts');

        res.status(200).json({
            success: true,
            message: "Successfully Fetched",
            result: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}


async function updateProfile(req, res, next) {
    try {
       
        const user = await User.findById(req.user._id);

        if(!req.body.email || !req.body.name) return res.status(403).json({ success: false, message: "One Or More Fields Are Blank", result: null });

        // good idea to trim 
        var email = req.body.email.trim();
        var name = req.body.name;

        const duplicateEmail = await User.findOne({email});

        if(duplicateEmail) return res.status(409).json({ success: false, message: "User Already Exists With This Email", result: null });

        user.name = name;
        user.email = email;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Updated",
            result: null
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}


async function updatePassword(req, res, next) {
    try {
       
        const user = await User.findById(req.user._id).select('+password');

        if(!req.body.oldPassword || !req.body.newPassword) return res.status(403).json({ success: false, message: "One Or More Fields Are Blank", result: null });

        const { oldPassword, newPassword } = req.body;

        if(oldPassword === newPassword) return res.status(409).json({ success: false, message: "Old Password and New Password Are Same", result: null });

        const isMatch = await user.matchPassword(oldPassword);

        if (!isMatch) return res.status(500).json({ success: false, message: "Invalid Password", result: null });

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password Updated",
            result: null
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}


async function deleteMyAccount(req, res, next) {
    try {

        const user = await User.findById(req.user._id);
        const userId = req.user._id;
        const posts = user.posts;
        const followers = user.followers;
        const followings = user.followings;
        await user.remove();

        // Logout This User
        const cookieOptions = {expires: new Date(Date.now()), httpOnly: true}
        res.cookie("token", null, cookieOptions);

        // Deleting All Posts of the User
        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.remove();            
        }
        
        // Removing This User From Follower's Following List
        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.remove();            
        }
        
        // Removing This User From Following's Follower LIst
        for (let i = 0; i < followings.length; i++) {
            const follows = await User.findById(followers[i]);
            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
            await follows.remove();            
        }

        res.status(200).json({ success: true, message: "Successfully Account Deleted", result: null });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message, result: null })
    }
}


async function logout(req, res, next) {
    try {
        const cookieOptions = {expires: new Date(Date.now()), httpOnly: true}
        res.status(200).cookie("token", null, cookieOptions).json({ success: true, message: "Successfully Logout", result: null });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message, result: null })
    }
}