import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization || '';

		if (!authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const token = authHeader.split(' ')[1];
		if (!token) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const secret = process.env.JWT_SECRET;
		if (!secret) {
			return res.status(500).json({ message: 'JWT secret is not configured' });
		}

		const decoded = jwt.verify(token, secret);
		const user = await User.findById(decoded.userId).select('-password');

		if (!user) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		req.user = {
			userId: user.id,
		};
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Unauthorized' });
	}
};

export default authMiddleware;
