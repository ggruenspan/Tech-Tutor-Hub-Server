// middleware/authenticateToken.js

const jwt = require('jsonwebtoken');

// Middleware to decode the JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET_OR_KEY, (err, decoded) => {
    if (err) return res.status(500).send({ message: 'Failed to authenticate token' });
    req.user = decoded;
    next();
  });
}

module.exports = authenticateToken;