const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000
};


async function registerUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const role = req.body.role === 'artist' ? 'artist' : 'user';

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }]
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      username: cleanUsername,
      email: cleanEmail,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, cookieOptions);
    return res.status(201).json({
      message: 'Account created successfully.',
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    return res.status(500).json({ message: 'Server error during registration.' });
  }
}

async function loginUser(req, res) {
  try {
    const { username, email, password, role } = req.body;
    const identifier = (email || username || '').trim();
    const selectedRole = role === 'artist' ? 'artist' : 'user';

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password.' });
    }

    const user = await userModel.findOne({
      $or: [{ username: identifier }, { email: identifier.toLowerCase() }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    if (user.role !== selectedRole) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}. Please choose ${user.role} login.`
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.cookie('token', token, cookieOptions);
    return res.status(200).json({
      message: 'Login successful.',
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
}

function logoutUser(req, res) {
  res.clearCookie('token', cookieOptions);
  return res.status(200).json({ message: 'User logged out successfully.' });
}

async function getCurrentUser(req, res) {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json({
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to fetch user.' });
  }
}

module.exports = { registerUser, loginUser, logoutUser, getCurrentUser };
