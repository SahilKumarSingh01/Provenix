const express =require('express');
const {signUp,sendOTP,verifyOTP,forgotPassword,resetPassword
      ,login,logout,googleAuth,githubAuth,githubAuthCallback} = require('../controllers/authController.js');

require("dotenv").config();
const routes  =express.Router();

  //github signin routes
  routes.get('/github',githubAuth);
  routes.get("/github/callback",githubAuthCallback);
  //google signin routes
  routes.get('/google',googleAuth);
  routes.get('/google/callback',googleAuthCallback);
  
  // Login Route
routes.post('/login',login);
routes.post('/signup',signUp);
routes.post('/sendotp',sendOTP);
routes.post('/verifyotp',verifyOTP);
routes.post('/forgot-password', forgotPassword);
routes.post('/reset-password',resetPassword);
//logout
routes.get('/logout', logout);

module.exports=routes;