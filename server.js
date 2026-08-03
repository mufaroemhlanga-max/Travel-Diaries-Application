require('dotenv').config();
const session = require('express-session');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const express = require('express');
const mongoose = require('mongoose');
const app = express();


app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // logged in for30 days

}));
const PORT = 3000;

app.use(express.static('public'));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

