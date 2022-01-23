const Post = require('../models/post.model');
const User = require('../models/user.model');

module.exports = { createPost, likeAndUnlikePost, getPostofFollowing, updatePostCaption, deletePost };

async function createPost(req, res) {
    try {
        const newPostData = {
            caption: req.body.caption,
            image: { public_id: "http", url: "http"},
            owner: req.user._id
        }

        const post = await Post.create(newPostData);

        const user = await User.findById(req.user._id);

        user.posts.push(post._id);

        await user.save();

        res.status(201).json({
            success: true,
            message: "Post is created",
            result: post
        })
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}

async function likeAndUnlikePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) return  res.status(200).json({ success: false, message: "Not Found", result: null })

        if(post.likes.includes(req.user._id)){
            const index = post.likes.indexOf(req.user._id);

            post.likes.splice(index, 1);

            await post.save();

            res.status(200).json({
                success: true,
                message: "Post Unliked",
                result: null
            })
        } else {
            post.likes.push(req.user._id);
            await post.save();

            res.status(200).json({
                success: true,
                message: "Post Liked",
                result: null
            })
        }        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}

async function getPostofFollowing(req, res) {
    try {
        
        const user = await User.findById(req.user._id);

        const posts = await Post.find({owner: { $in: user.following }});

        res.status(200).json({
            success: true,
            message: "Post oF Following...",
            result: posts
        })
     
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}

async function updatePostCaption(req, res) {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) return  res.status(200).json({ success: false, message: "Not Found", result: null })
        
        if(post.owner.toString() !== req.user._id.toString()) return res.status(401).json({ success: false, message: "Unauthorized", result: null })
        
        post.caption = req.body.caption;
        await post.save();

        res.status(200).json({
            success: true,
            message: "Post Updated",
            result: null
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}

async function deletePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) return  res.status(200).json({ success: false, message: "Not Found", result: null })
        
        if(post.owner.toString() !== req.user._id.toString()) return res.status(401).json({ success: false, message: "Unauthorized", result: null })
        
        await post.remove();

        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Post Deleted",
            result: null
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            result: null
        })
    }
}