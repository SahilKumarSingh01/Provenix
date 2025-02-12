const express =require('express');
const mongoose=require('mongoose');
const bycrypt=require('bycrypt');
const User = require('../models/User.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GithubStrategy= require('passport-github2').Strategy;
const GoogleStrategy= require('passport-google-oauth20').Strategy;
const cloudinary=require('../config/cloudinary.js');
const resend=require('../config/resend.js');
require("dotenv").config();
const routes  =express.Router();


const UniqueUsername = async (displayName) => {
  let baseUsername = displayName.replace(/\s+/g, '').toLowerCase();
  const lastUser = await User.findOne({ username: new RegExp(`^${baseUsername}\\d*$`)}).sort({ username: -1 })
  if (!lastUser)
    return baseUsername; 
  const num = lastUser.username.match(/\d+$/); // Get trailing number
  return `${baseUsername}${parseInt(num[0])+1}`;
};

const generateOTP = () => {
  return String(Date.now() % 1000000); // Ensures a 6-digit OTP
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
            if(!user)
            {
                const result=await cloudinary.uploader.upload(profile.photos[0].value, {folder: "profile_pictures",});
                const photo =profile.photos[0].value;
                const displayName=profile.displayName;
                const username=await UniqueUsername(displayName);
                user=await User.create({googleid,email,photo,displayName,verifiedEmail:true,username});
            }
            console.log(user);
            return done(null,user);
          }catch(e)
          {
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
          const githubid=profile.id;
          let user =await User.findOne({githubid});
          if(!user)
          {
            try{
              const result=await cloudinary.uploader.upload(profile.photos[0].value, {folder: "profile_pictures",});
              const photo =profile.photos[0].value;
              const displayName=profile.displayName;
              const username=await UniqueUsername(displayName);
              user=await User.create({githubid,photo,displayName,username});
            }
            catch(e)
            {
              console.log(e.message);
            }
          }
          return done(null, user);
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
      const user= await User.findOne({$or:[{username},{email}]});
      if(user)
        return req.status(400).json({message:"username or email is already taken"});
      const hashPassword=await bycrypt(password,10);
      User.create({username,password:hashPassword,email});
    }catch(e)
    {
      req.status(500).json({message:"server error"});
    }
})

const OTP_EXPIRY = 2000*60; // Set time limit (e.g., 2 minutes)
routes.post('/sendotp',async(req,res)=>{
  try{
    const {email}=req.body;
    const user=User.findOne({email});
    if(!user)
      return res.status(400).json({success:false,message:"User not found"});
    if(user.verifiedEmail)
      return res.status(400).json({success:false,message:"email is already verified"});
    if(user.OTPSendTime+OTP_EXPIRY>Date.now())
      return res.status(429).json({success:false,message:"please wait for otp to expire"});
    verificationOTP=generateOTP();
    await User.updateOne({email},{verificationOTP,OTPSendTime:Date().now()});

    await resend.emails.send({
      from: "provenix@resend.dev", // Must be verified on Resend
      to: email,
      subject: "Your Verification Code for provenix",
      html: `<p>Your verification code is: <strong>${verificationOTP}</strong></p>`,
    })
  }catch(e){
    res.status(500).json({message:e.message});
  }
});
routes.post('/verifyotp',async(req,res)=>{
    const {otp,email}=req.body;
    const user=User.findOne({email});
    if(!user)
        return res.status(400).json({success:false,message:"User not found"});
    if(user.verifiedEmail)
        return res.status(400).json({success:false,message:"user is already verified"});
    if(user.verificationOTP!==otp)
        return res.status(400).json({success:false,message:"otp mismatch"});
    user.verificationOTP=null;
    user.verifiedEmail=true;
    await user.save();
    res.status(200).json({message:"email verified"});
})
  // Logout Route
routes.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logout successful" });
    });
  });

module.exports=routes;