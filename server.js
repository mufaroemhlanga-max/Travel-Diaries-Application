require('dotenv').config(); //Loads MONGODB URI and SESSION_SECRET from .env into process.env
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); //Force Node to use Google DNS - school network's DNS was refusing MongoDB's SRV lookup
const session = require('express-session');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const weatherRoutes = require('./routes/weather');


app.use(express.json()); //Parses incoming JSON request bodies (used by the auth routes)
app.use('/api/weather', weatherRoutes);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // logged in for 30 days
}));
const PORT = process.env.PORT || 3000;


app.use(express.static('public')); // Serves index.html, CSS, client side JS and uploaded photos directly
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

