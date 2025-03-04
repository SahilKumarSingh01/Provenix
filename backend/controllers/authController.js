require('dotenv').config();
const {googleAuth,googleAuthCallback}=require('./auth/googleAuth.js');
const {githubAuth,githubAuthCallback}=require('./auth/githubAuth.js');
const {login,logout}=require('./auth/login.js');
const {sendOTP,verifyOTP}=require('./auth/otp.js');
const {forgotPassword,resetPassword}=require('./auth/forgotPassword.js');
const signUp=require('./auth/signUp.js');
const getUser=require('./auth/getUser.js');
module.exports={signUp,sendOTP,verifyOTP,forgotPassword,resetPassword,
            login,logout,googleAuth,googleAuthCallback,githubAuth,githubAuthCallback,getUser};