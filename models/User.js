//A registered user account. Passswords are hashed with bcrypt before saving (see routes/auth.js) never saved as plain text
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}); 

module.exports = mongoose.model('User', userSchema);