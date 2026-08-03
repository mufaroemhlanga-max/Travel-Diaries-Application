const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    try {
        const { username, 
            email, 
            password 
        } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error registering user', error: error.message});
    }
});



router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        req.session.userId = user._id;
         res.status(200).json({ message: 'Login successful', username: user.username });



    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error logging in', error: error.message });
    }

});
// Returns info about the currently logged-in user, based on their session
// Used by the frontend to check login status without asking for credentials again


router.get('/me', async (req, res) => {
    try {
                // No userId in session means this browser hasn't logged in (or the session expired)

        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not logged in' });

        }
        // Look up the full user record using the ID stored in their session

        const user = await User.findById(req.session.userId);
        res.status(200).json({ username: user.username, email: user.email });
    
            // Something unexpected failed server-side (e.g. database issue)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err.message });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});
module.exports = router;
