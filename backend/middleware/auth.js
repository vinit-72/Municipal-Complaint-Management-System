const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (e) {
        console.error('[AUTH] token verify error', e);
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'No user in request' });
    if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin access required' });
    next();
};

module.exports = { authMiddleware, adminMiddleware };
