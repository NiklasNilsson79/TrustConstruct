const jwt = require('jsonwebtoken');

function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Sprint 2: hardcoded auth, role baserat på email
  const role = String(email).toLowerCase().includes('manager')
    ? 'manager'
    : 'worker';

  const user = {
    id: 'u_123',
    email,
    role,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return res.status(200).json({ token, user });
}

module.exports = { login };
