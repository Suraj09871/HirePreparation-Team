const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const { auth } = require('../middleware/auth');
const https = require('https');

// Generate JWT token
function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}

// Admin Secret Key - required for developer/admin access
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'HIRESMART-ADMIN-2026-X9K3';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, adminKey } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        // Determine role - verify admin key if admin role requested
        let assignedRole = role || 'student';
        if (assignedRole === 'admin') {
            if (!adminKey || adminKey !== ADMIN_SECRET_KEY) {
                return res.status(403).json({ success: false, message: 'Invalid Admin Secret Key. Contact your project lead.' });
            }
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
            role: assignedRole
        });
        await user.save();

        // Create empty student profile if role is student
        if (user.role === 'student') {
            const profile = new StudentProfile({ userId: user._id });
            await profile.save();
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, adminKey } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        // If adminKey is provided, verify it for admin access
        if (adminKey) {
            if (adminKey !== ADMIN_SECRET_KEY) {
                return res.status(403).json({ success: false, message: 'Invalid Admin Secret Key.' });
            }
            // Upgrade user to admin if valid key provided
            if (user.role !== 'admin') {
                user.role = 'admin';
            }
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/auth/me - Get current user
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/auth/google - Google OAuth Login/Registration
router.post('/google', async (req, res) => {
    try {
        const { token, role } = req.body;
        
        if (!token) {
            return res.status(400).json({ success: false, message: 'No token provided' });
        }

        // Verify token with Google
        const verifyGoogleToken = (tokenId) => {
            return new Promise((resolve, reject) => {
                https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        const parsed = JSON.parse(data);
                        if (parsed.error) reject(new Error(parsed.error_description || 'Invalid token'));
                        else resolve(parsed);
                    });
                }).on('error', reject);
            });
        };

        const payload = await verifyGoogleToken(token);
        const { sub: googleId, email, name, picture: avatar } = payload;

        // Find existing user by email
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user with google info if not present
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                if (!user.avatar) user.avatar = avatar;
                await user.save();
            }
        } else {
            // Create new user
            user = new User({
                name,
                email,
                googleId,
                avatar,
                authProvider: 'google',
                role: role || 'student'
            });
            await user.save();

            // Create empty student profile if role is student
            if (user.role === 'student') {
                const profile = new StudentProfile({ userId: user._id });
                await profile.save();
            }
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        const jwtToken = generateToken(user._id);

        res.json({
            success: true,
            message: 'Google login successful!',
            token: jwtToken,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify Google token: ' + error.message });
    }
});

// POST /api/auth/admin-login
router.post('/admin-login', async (req, res) => {
    try {
        const { email, adminKey } = req.body;

        if (adminKey !== ADMIN_SECRET_KEY) {
            return res.status(403).json({ success: false, message: 'Invalid Admin Secret Key' });
        }

        let user = await User.findOne({ email });
        
        if (!user) {
            // Create a new admin user if not found
            user = new User({
                name: email.split('@')[0],
                email,
                role: 'admin',
                authProvider: 'local',
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            });
            await user.save();
        } else if (user.role !== 'admin') {
            // Upgrade role to admin
            user.role = 'admin';
            await user.save();
        }

        user.lastLogin = Date.now();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
