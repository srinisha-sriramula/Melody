const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Please login.' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function authArtist(req, res, next) {
  authRequired(req, res, () => {
    if (req.user.role !== 'artist') {
      return res.status(403).json({ message: 'Artist access required.' });
    }
    next();
  });
}

// Both logged-in users and artists can browse music.
function authUser(req, res, next) {
  authRequired(req, res, next);
}

module.exports = { authRequired, authArtist, authUser };
