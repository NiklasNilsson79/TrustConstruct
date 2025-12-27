// backend/src/middleware/requireAuth.js
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');

    if (type !== 'Bearer' || !token) {
      return res
        .status(401)
        .json({ message: 'Missing or invalid Authorization header' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // VIKTIGT: dessa nycklar måste matcha hur ni signar token i authController
    req.user = {
      userId: payload.userId || payload.id || payload.sub,
      name: payload.name,
      company: payload.company,
      role: payload.role,
    };

    if (!req.user.name || !req.user.company || !req.user.role) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    next();
  } catch (_err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

module.exports = requireAuth;
