const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController.js');


// LeetCode profile route
router.get('/leetcode', profileController.getLeetcode);
router.get('/codeforces', profileController.getCodeforces);
router.get('/github', profileController.getGithub);

// Fetch all users and user profile
router.get('/all-users', profileController.getAll);
router.get('/notifications', profileController.getNotifications);
router.patch('/mark-read', profileController.markNotification);
router.get('/my-profile', profileController.getMyProfile); // New route to get user's own profile
router.get('/:username', profileController.getProfile);

// Routes for setting profile links
router.put('/set', profileController.setCodingProfile);

// Routes for verifying profile links
router.put('/verify/leetcode', profileController.verifyLeetcode);
router.put('/verify/codeforces', profileController.verifyCodeforces);
router.put('/verify/github', profileController.verifyGithub);
// Routes for getting all public Ids


// Route to update user's own profile
router.put('/update-my-profile', profileController.updateMyProfile); // New route to update user profile

// Account management routes
router.post('/generate-token', profileController.generateToken);         // To generate deletion token
router.delete('/delete-account', profileController.verifyAndDelete);  // To verify token & mark deleted
router.post('/recover-account', profileController.recoverAccount);       
module.exports = router;
