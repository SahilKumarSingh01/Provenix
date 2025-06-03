const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController.js');
const razorpayAccountController=require('../controllers/razorpayAccountController.js');
const isAuthenticated=require('../middlewares/authMiddleware.js')

// LeetCode profile route
router.get('/leetcode', profileController.getLeetcode);
router.get('/codeforces', profileController.getCodeforces);
router.get('/github', profileController.getGithub);

//razorpay account routes
router.post('/create-razorpay-account',isAuthenticated,razorpayAccountController.create);
router.get('/get-razorpay-account',isAuthenticated,razorpayAccountController.get);
// router.put('/update-razorpay-account',isAuthenticated,razorpayAccountController.update);
router.put('/deactivate-razorpay-account',isAuthenticated,razorpayAccountController.deactivate);
router.put('/activate-razorpay-account',isAuthenticated,razorpayAccountController.activate);
// Fetch all users and user profile
router.get('/all-users', profileController.getAll);
router.get('/notifications',isAuthenticated, profileController.getNotifications);
router.patch('/mark-read',isAuthenticated, profileController.markNotification);
router.get('/my-profile',isAuthenticated, profileController.getMyProfile); // New route to get user's own profile
router.get('/:username', profileController.getProfile);

// Routes for setting profile links
router.put('/set',isAuthenticated, profileController.setCodingProfile);

// Routes for verifying profile links
router.put('/verify/leetcode',isAuthenticated, profileController.verifyLeetcode);
router.put('/verify/codeforces',isAuthenticated, profileController.verifyCodeforces);
router.put('/verify/github',isAuthenticated, profileController.verifyGithub);
// Routes for getting all public Ids



// Route to update user's own profile
router.put('/update-my-profile',isAuthenticated, profileController.updateMyProfile); // New route to update user profile

// Account management routes
router.post('/generate-token,',isAuthenticated, profileController.generateToken);         // To generate deletion token
router.delete('/delete-account',isAuthenticated, profileController.verifyAndDelete);  // To verify token & mark deleted
router.post('/recover-account',isAuthenticated, profileController.recoverAccount);       
module.exports = router;
