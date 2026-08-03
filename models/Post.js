const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    photo: {
        type: String,
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