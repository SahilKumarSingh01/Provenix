const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController.js');

// Fetch all users and user profile
router.get('/all-users', profileController.getAll);
router.get('/:username', profileController.getProfile);
router.get('/my-profile', profileController.getMyProfile); // New route to get user's own profile

// Routes for setting profile links
router.post('/set', profileController.setCodingProfile);

// Routes for verifying profile links
router.post('/verify/leetcode', profileController.verifyLeetcode);
router.post('/verify/codeforces', profileController.verifyCodeforces);
router.post('/verify/github', profileController.verifyGithub);

// Route to update user's own profile
router.put('/update-my-profile', profileController.updateMyProfile); // New route to update user profile

module.exports = router;
