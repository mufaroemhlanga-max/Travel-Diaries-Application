const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

//Create a new post for a logged in user
router.post('/', async (req, res) => {
    try {
        //Block the request if the user is not logged in and not registered
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        const { photo, description, travelDate } = req.body;
        const newPost = new Post({
            user: req.session.userId,
            photo,
            description,
            travelDate
        });


        await newPost.save();
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating post', error: error.message });
    }
});

//Fetches all travel posts, newest first with the poster's username included
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username') // Populate the user field with only the username
            .sort({ createdAt: -1 }); // Sort by creation date, newest first
        
        res.status(200).json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
});

// Updates an existing post only if the logged-in user is the owner of the post
router.put('/:Id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        const post = await Post.findById(req.params.Id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Only the user who created the post can update it
        if (post.user.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'You are not authorized to update this post' });
        }

        const { photo, description, travelDate } = req.body;
        if (photo) post.photo = photo;
        if (description) post.description = description;
        if (travelDate) post.travelDate = travelDate;

        await post.save();
        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error updating post', error: error.message });
    }   
});

// Deletes an existing post only if the logged-in user is the owner of the post
router.delete('/:Id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        const post = await Post.findById(req.params.Id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Only the user who created the post can delete it
        if (post.user.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this post' });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error deleting post', error: error.message });
    }

});
module.exports = router;