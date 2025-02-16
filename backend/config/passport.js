const passport = require('passport');
const bcrypt=require('bcrypt');
const LocalStrategy = require('passport-local');
const GithubStrategy= require('passport-github2').Strategy;
const GoogleStrategy= require('passport-google-oauth20').Strategy;
const User = require('../models/User.js');
const cloudinary=require('../config/cloudinary.js');
require("dotenv").config();
const UniqueUsername = async (displayName) => {
    let baseUsername = displayName.replace(/\s+/g, '');
    const lastUser = await User.findOne({ username: new RegExp(`^${baseUsername}\\d*$`)}).sort({ username: -1 })
    if (!lastUser)
      return baseUsername; 
    const num = lastUser.username.match(/\d+$/); // Get trailing number
    const val=num?parseInt(num[0]):0;
    return `${baseUsername}${val+1}`;
  };

  // Local Strategy
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username ,});
      if (!user)
           return done(null, false, { message: "User not found" });
      if(!user.password)
            return done(null,false,{message:"password is not set"});
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
                // console.log("we reach herer",{githubid,photo,displayName,username});
            }
            // console.log(profile);
            // console.log(user);
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
module.exports=passport;
  