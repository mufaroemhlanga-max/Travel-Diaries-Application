const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });


//Create a new post for a logged in user
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        //Block the request if the user is not logged in and not registered
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        const {  description, travelDate } = req.body;
        if (new Date(travelDate) > new Date()) {
  return res.status(400).json({ message: 'Travel date cannot be in the future' });
}

        const photo = req.file.filename; // Get the filename of the uploaded photo
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
    // Fetches only the logged-in user's own posts, newest first
router.get('/mine', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not logged in' });
    }

    const posts = await Post.find({ user: req.session.userId })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching your posts', error: error.message });
  }
});

// Fetches a single post by ID (used to pre-fill the edit form)
router.get('/:Id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.Id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
});

// Updates an existing post only if the logged-in user is the owner of the post
router.put('/:Id', upload.single('photo'), async (req, res) => {
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

        const { description, travelDate } = req.body;
        if (req.file) post.photo = req.file.filename;
        if (description) post.description = description;
        if (travelDate) {
            if (new Date(travelDate) > new Date()) {
                return res.status(400).json({ message: 'Travel date cannot be in the future' });
            }
            post.travelDate = travelDate;
        }

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