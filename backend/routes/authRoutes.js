const express =require('express');
const mongoose=require('mongoose');
const User = require('../models/User.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GithubStrategy= require('passport-github2').Strategy;
const GoogleStrategy= require('passport-google-oauth20').Strategy;
// const googleStateg
require("dotenv").config();
const routes  =express.Router();

// Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user)
         return done(null, false, { message: "User not found" });

    // Compare passwords (plaintext, no hashing)
    if (user.password !== password) return done(null, false, { message: "Invalid password" });

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
          console.log(profile);
          return done(null,profile);
         }
))
//github strategy
passport.use(new GithubStrategy({
        clientID:process.env.GITHUB_CLIENT_ID,
        clientSecret:process.env.GITHUB_CLIENT_SECRET,
        callbackURL:"http://localhost:5000/auth/github/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
          console.log(profile);
          return done(null, profile);
        }
))

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
    console.log("we are in serializeUser");
  done(null, user);
});

// Deserialize user (retrieve user from DB using stored ID)l
passport.deserializeUser(async (id, done) => {
  try {
    // console.log("here we are "+id);
    const user = await User.findById(new mongoose.Types.ObjectId(id));
    done(null, user);
  } catch (err) {
    done(err);
  }
});

//github signin routes
routes.get('/github',passport.authenticate('github',{ scope: ["user:email"] }));
routes.get("/github/callback",passport.authenticate('github', {failureRedirect: "http://localhost:5000/auth/login"}));
//google signin routes
routes.get('/google',passport.authenticate('google',{scope:['email','profile']}));
routes.get('/google/callback',passport.authenticate('google',{failureRedirect:"http://localhost:5000/auth/login"}));

routes.get('/login', (req, res) => {
  console.log("User logged in successfully");
  res.json({ message: "Login successful"});
});
// Login Route
routes.post('/login', passport.authenticate('local'), (req, res) => {
    console.log("User logged in successfully");
    res.json({ message: "Login successful", user: req.session.passport.user });
  });
 
  // Logout Route
routes.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logout successful" });
    });
  });

module.exports=routes;