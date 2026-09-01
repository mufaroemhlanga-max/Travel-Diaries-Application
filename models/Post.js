// A single travel post. `user` links back to its owner (see routes/post.js for the ownership checks on edit/delete).
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    photos: { // The filename of the uploaded photo, stored in /public/uploads by Multer
        type: [String],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    travelDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);