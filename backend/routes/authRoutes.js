const express =require('express');
const authController = require('../controllers/authController.js');

require("dotenv").config();
const routes  =express.Router();

  //github signin routes
  routes.get('/github',authController.githubAuth);
  routes.get("/github/callback",authController.githubAuthCallback);
  //google signin routes
  routes.get('/google',authController.googleAuth);
  routes.get('/google/callback',authController.googleAuthCallback);
  
  // Login Route
// routes.post('/me',)
routes.post('/login',authController.login);
routes.post('/signup',authController.signUp);
routes.post('/send-otp',authController.sendOTP);
routes.post('/verify-otp',authController.verifyOTP);
routes.post('/forgot-password', authController.forgotPassword);
routes.post('/reset-password',authController.resetPassword);
routes.get('/me',authController.getUser)
//logout
routes.get('/logout', authController.logout);

module.exports=routes;