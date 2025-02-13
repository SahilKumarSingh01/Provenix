const express =require('express');
const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const User = require('../models/User.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GithubStrategy= require('passport-github2').Strategy;
const GoogleStrategy= require('passport-google-oauth20').Strategy;
const cloudinary=require('../config/cloudinary.js');
const sendMail=require('../models/sendMail.js');
const crypto = require('crypto');
require("dotenv").config();
const routes  =express.Router();


const UniqueUsername = async (displayName) => {
  let baseUsername = displayName.replace(/\s+/g, '');
  const lastUser = await User.findOne({ username: new RegExp(`^${baseUsername}\\d*$`)}).sort({ username: -1 })
  if (!lastUser)
    return baseUsername; 
  const num = lastUser.username.match(/\d+$/); // Get trailing number
  const val=num?parseInt(num[0]):0;
  return `${baseUsername}${val+1}`;
};

const generateOTP = () => {
  const timeMicro=Math.floor(performance.now()*10000)%1000000;
  return timeMicro.toString().padStart(6,'0'); // Ensures a 6-digit OTP
};
// Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username ,});
    if (!user)
         return done(null, false, { message: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return done(null, false, { message: "Invalid password" });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));


passport.use(new GoogleStrategy({
         clientID:process.env.GOOGLE_CLIENT_ID,
         clientSecret:process.env.GOOGLE_CLIENT_SECRET,
         callbackURL:"http://localhost:5000/auth/google/callback"
         },
         async(accessToken,refreshToken,profile,done)=>{
          try{
            const googleid=profile.id;
            const email=profile.emails[0].value;
            let user =await User.findOne({$or:[{googleid},{email}]});
            const username=await UniqueUsername(profile.displayName);
            // console.log(username);
            if(!user)
            {
                const result=await cloudinary.uploader.upload(profile.photos[0].value, {folder: "profile_pictures",});
                const photo =result.url;
                const displayName=profile.displayName;
                const username=await UniqueUsername(displayName);
                user=await User.create({googleid,email,photo,displayName,verifiedEmail:true,username});
            }
            console.log(user);
            return done(null,user);
          }catch(e){
            return done(e);
          }
         }
))

//github strategy
passport.use(new GithubStrategy({
        clientID:process.env.GITHUB_CLIENT_ID,
        clientSecret:process.env.GITHUB_CLIENT_SECRET,
        callbackURL:"http://localhost:5000/auth/github/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          // console.log(profile);
          try{
            const githubid=profile.id;
            let user =await User.findOne({githubid});
            if(!user)
            {
                const result=await cloudinary.uploader.upload(profile.photos[0].value, {folder: "profile_pictures",});
                const photo =result.url;
                const displayName=profile.username;
                const username=await UniqueUsername(displayName);
                user=await User.create({githubid,photo,displayName,username});
                console.log("we reach herer",{githubid,photo,displayName,username});
            }
            console.log(profile);
            console.log(user);
            return done(null, user);
          }catch(e){
            return done(e);
          }
        }
))

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {done(null, user.id);});

// Deserialize user (retrieve user from DB using stored ID)l
passport.deserializeUser(async (id, done) => {done(null,{id});});//only user.id will be available do all lookup based on that 

//github signin routes
routes.get('/github',passport.authenticate('github',{ scope: ["user:email"] }));
routes.get("/github/callback",passport.authenticate('github', {failureRedirect: "http://localhost:5000/auth/login"}));
//google signin routes
routes.get('/google',passport.authenticate('google',{scope:['email','profile']}));
routes.get('/google/callback',passport.authenticate('google',{failureRedirect:"http://localhost:5000/auth/login"}));

// Login Route
routes.post('/login', passport.authenticate('local'), (req, res) => {
    console.log("User logged in successfully");
    res.json({ message: "Login successful", user: req.session.passport.user });
  });

routes.post('/signup',async (req,res)=>{
    try{
      const {username,password,email}=req.body;
      // Regular Expressions
      const usernameRegex = /^[^\s]+$/;  // Username should not contain spaces
      const passwordRegex = /^.{6,}$/;  // Password should be at least 6 characters
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  // Valid email format
      if (!username || !usernameRegex.test(username))
        return res.status(400).json({ message: "Username must not contain spaces and cannot be empty." });
      if (!password || !passwordRegex.test(password)) 
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
      if (!email || !emailRegex.test(email))
        return res.status(400).json({ message: "Please provide a valid email." });
      let user= await User.findOne({$or:[{username},{email}]});
      if(user)
        return res.status(400).json({message:"you already have account try sign in"});
      const hashPassword=await bcrypt.hash(password,10);
      user=await User.create({username,password:hashPassword,email});
      // console.log(user);
      return res.status(200).json({success:true,message:"user log in successfully"});
    }catch(e){
      res.status(500).json({message:"server error"+e.message});
    }
})

const OTP_EXPIRY_TIME = 1; // Set time limit (e.g., 2 minutes)
const OTP_RESEND_TIME = 10;
routes.post('/sendotp',async(req,res)=>{
  try{
    const {email}=req.body;
    const user=await User.findOne({email});
    if(!user)
      return res.status(400).json({success:false,message:"User not found"});
    if(user.verifiedEmail)
      return res.status(400).json({success:false,message:"email is already verified"});
    if(user.OTPSendTime+OTP_RESEND_TIME> Date.now())
      return res.status(429).json({success:false,message:"please wait for otp to expire"});
    verificationOTP=generateOTP();
    await sendMail({
        from: process.env.SENDER_EMAIL,  // Sender email
        to: email,                   // Recipient email
        subject: "Your OTP Code",
        html: `<p>Your OTP code is: <strong>${verificationOTP}</strong></p><p>This code will expire in ${OTP_EXPIRY/(1000*60)} minutes.</p>`
    })
    await User.updateOne({email},{verificationOTP,OTPSendTime:Date.now()});
    console.log(verificationOTP)
    return res.status(200).json({success:true,message:"opt has been sent",email});
  }catch(e){
    return res.status(500).json({message:e.message});
  }
});

routes.post('/verifyotp',async(req,res)=>{
    const {otp,email}=req.body;
    const user=await User.findOne({email});
    if(!user)
        return res.status(400).json({success:false,message:"User not found"});
    if(user.verifiedEmail)
        return res.status(400).json({success:false,message:"user is already verified"});
    if(user.verificationOTP!==otp)
        return res.status(400).json({success:false,message:"otp mismatch"});
    if(user.OTPSendTime+OTP_EXPIRY_TIME<Date.now())
      return res.status(429).json({success:false,message:"otp is expire"});
    user.verificationOTP=null;
    user.verifiedEmail=true;
    await user.save();
    return res.status(200).json({message:"email verified"});
})


routes.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });
    if (!user.verifiedEmail)
      return res.status(400).json({ success: false, message: "Email not verified" });
    if (user.resetPasswordToken && user.resetPasswordExpiry > Date.now()) 
      return res.status(400).json({ message: 'Please wait for the current reset link to expire before requesting a new one.' });
    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // Expires in 15 min
    await user.save();
    console.log(resetToken)
    await sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Password Reset Link",
      html: `<p>Click the link below to reset your password:</p>
             <a href="http://localhost:3000/reset-password?token=${resetToken}">Reset Password</a>
             <p>This link will expire in 15 minutes.</p>`
    });
    return res.status(200).json({ success: true, message: "Password reset link sent" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

routes.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() } // Token must be valid (not expired)
    });

    if (!user)
      return res.status(400).json({ success: false, message: "Invalid or expired token" });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null; // Remove token after use
    user.resetPasswordExpiry = null;
    await user.save();

    return res.status(200).json({ success: true, message: "Password has been reset successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

  // Logout Route
routes.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logout successful" });
    });
  });

module.exports=routes;