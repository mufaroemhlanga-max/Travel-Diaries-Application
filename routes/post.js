const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const heicConvert = require('heic-convert');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// If a file is actually HEIC/HEIF (regardless of its extension), converts it to a real JPEG.
// If it's not HEIC, the conversion attempt fails harmlessly and the original file is kept as-is.
async function convertIfHeic(file) {
  const inputPath = path.join('public/uploads', file.filename);
  const inputBuffer = await fs.readFile(inputPath);

  try {
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 1
    });

    const newFilename = file.filename.replace(/\.[^.]+$/, '') + '-converted.jpg';
    await fs.writeFile(path.join('public/uploads', newFilename), outputBuffer);
    await fs.unlink(inputPath); // Remove the original HEIC file, it's no longer needed

    return newFilename;
  } catch (error) {
    // Not actually a HEIC file — keep it exactly as uploaded
    return file.filename;
  }
}


//Create a new post for a logged in user
router.post('/', upload.array('photos', 5), async (req, res) => {
    try {
        //Block the request if the user is not logged in and not registered
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        const {  description, travelDate } = req.body;
        if (new Date(travelDate) > new Date()) {
  return res.status(400).json({ message: 'Travel date cannot be in the future' });
}

        const photos = await Promise.all(req.files.map(file => convertIfHeic(file))); // Convert any HEIC photos to JPEG, keep others as-is
        const newPost = new Post({
            user: req.session.userId,
            photos,
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
    if (!mongoose.Types.ObjectId.isValid(req.params.Id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

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
router.put('/:Id', upload.array('photos', 5), async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.Id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
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
        if (req.files && req.files.length > 0) {
            post.photos = await Promise.all(req.files.map(file => convertIfHeic(file)));
        }
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

// Deletes a single photo from a post by its position in the array, keeping the rest.
// A post must always have at least one photo — delete the whole post instead if removing the last one.
router.delete('/:Id/photos/:index', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.Id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
        }

        const post = await Post.findById(req.params.Id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.user.toString() !== req.session.userId) {
            return res.status(403).json({ message: 'You are not authorized to edit this post' });
        }

        const index = parseInt(req.params.index, 10);
        if (isNaN(index) || index < 0 || index >= post.photos.length) {
            return res.status(400).json({ message: 'Invalid photo index' });
        }

        if (post.photos.length === 1) {
            return res.status(400).json({ message: 'A post must have at least one photo. Delete the whole post instead.' });
        }

        const [removedPhoto] = post.photos.splice(index, 1);
        await post.save();
        await fs.unlink(path.join('public/uploads', removedPhoto)).catch(() => {});

        res.status(200).json({ message: 'Photo deleted successfully', post });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error deleting photo', error: error.message });
    }
});

// Deletes an existing post only if the logged-in user is the owner of the post
router.delete('/:Id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.Id)) {
            return res.status(400).json({ message: 'Invalid post ID' });
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