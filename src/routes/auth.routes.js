
const express = require('express');

const authController = require('../controllers/auth.controller');

const {
  authRequired
} = require('../middlewares/auth.middleware');

const router = express.Router();

// Register
router.post('/register', authController.registerUser);

// Login
router.post('/login', authController.loginUser);

// Logout
router.post('/logout', authController.logoutUser);

// Get logged-in user
router.get('/me', authRequired, authController.getCurrentUser);

module.exports = router;
