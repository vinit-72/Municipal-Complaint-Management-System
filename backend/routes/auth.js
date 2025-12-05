const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        const exstng = await User.findOne({ email });
        if (exstng) return res.status(400).json({ msg: 'Email already registered' });

        const hshdPswd = await bcrypt.hash(password, 10);
        const usr = new User({ username, email, password: hshdPswd, role });
        await usr.save();
        res.status(201).json({ msg: 'User registered successfully' });
    } catch (err) {
        console.error('[API] /api/auth/register error:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const usr = await User.findOne({ email });
        if (!usr) return res.status(400).json({ msg: 'User not found' });

        const isMtch = await bcrypt.compare(password, usr.password);
        if (!isMtch) return res.status(400).json({ msg: 'Invalid credentials' });

        const scrt = process.env.JWT_SECRET || 'dev_jwt_secret';
        const tkn = jwt.sign({ id: usr._id, role: usr.role }, scrt, { expiresIn: '1h' });
        res.json({ token: tkn, user: { id: usr._id, username: usr.username, role: usr.role, email: usr.email } });
    } catch (err) {
        console.error('[API] /api/auth/login error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
