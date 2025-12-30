const jwt = require('jsonwebtoken');

const USERS = [
  {
    id: 'u_niklas',
    name: 'Niklas Nilsson',
    company: 'Nelzon Production AB',
    role: 'worker',
  },
  {
    id: 'u_carl',
    name: 'Carl Andersson',
    company: 'CA Electric AB',
    role: 'worker',
  },
  {
    id: 'u_tobias',
    name: 'Tobias Pettersson',
    company: 'Manager Solutions AB',
    role: 'manager',
  },
];

function login(req, res) {
  const { name, company, password } = req.body || {};

  if (!name || !company || !password) {
    return res.status(400).json({
      message: 'Name, company and password are required',
    });
  }

  const user = USERS.find(
    (u) =>
      u.name === String(name).trim() && u.company === String(company).trim()
  );

  if (!user) {
    return res.status(401).json({
      message: 'Invalid name/company combination',
    });
  }

  // Demo-auth: vi kräver bara att password är ifyllt.

  if (String(password).trim().length === 0) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' });
  }

  const token = jwt.sign(
    {
      sub: user.id,
      name: user.name,
      company: user.company,
      role: user.role,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      company: user.company,
      role: user.role,
    },
  });
}

module.exports = { login };
