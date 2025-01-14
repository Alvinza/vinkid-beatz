const express = require('express');
const { createUser, adminOnlyRoute } = require('../controllers/userController');
const router = express.Router();

// Create user
router.post('/register', createUser);

// Example protected route for admin
router.get('/admin', async (req, res) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.status(200).json({ message: 'Welcome, admin!' });
});

module.exports = router;

