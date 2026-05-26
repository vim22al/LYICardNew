import { verifyToken } from '../../utils/jwt.js';
import { User } from '../models/user.model.js';
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ error: 'Not authorized, no token' });
            return;
        }
        const decoded = verifyToken(token);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Not authorized, token failed' });
    }
};
export const admin = (req, res, next) => {
    if (req.user && req.user.userType === 'admin') {
        next();
    }
    else {
        res.status(403).json({ error: 'Not authorized as an admin' });
    }
};
