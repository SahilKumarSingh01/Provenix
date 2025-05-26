const passport = require('passport');
const bcrypt=require('bcrypt');
const LocalStrategy = require('passport-local');
const GithubStrategy= require('passport-github2').Strategy;
const GoogleStrategy= require('passport-google-oauth20').Strategy;
const User = require('../models/User.js');
const Profile = require('../models/Profile.js');
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
      const user = await User.findOne({$or:[{ username },{email:username}]});
      if (!user)
           return done(null, false, { message: "User not found" });
      if(!user.password)
            return done(null,false,{message:"password is not set may be you login with google or github"});
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
           callbackURL:process.env.CLIENT_URL+"/auth/google/callback"
           },
           async(accessToken,refreshToken,profile,done)=>{
            try{
              const googleid=profile.id;
              const email=profile.emails[0].value;
              let user =await User.findOne({$or:[{googleid},{email}]});
              const username=await UniqueUsername(profile.displayName);
              
              if(!user)
              {
                const result = await cloudinary.uploader.upload(profile.photos[0].value, {
                  folder: "profile",
                  type: "authenticated",  // Private upload
                  format: "webp",         // Best compression
                  transformation: [
                      { width: 100, height: 100, crop: "fill" },  // Exact dimensions, crop to fit
                      { quality: "auto:low" },                   // Lower quality for better compression
                      { fetch_format: "auto" }                   // Use best format (WebP, JPEG)
                  ]
              });
                  const photo =result.secure_url;
                  const displayName=profile.displayName;
                  const username=await UniqueUsername(displayName);
                  const [newUser, newProfile] = await Promise.all([
                    User.create({ googleid, email, photo, displayName, verifiedEmail: true, username }),
                    Profile.create({})
                ]);
                await Promise.all([ 
                  User.updateOne({ _id: newUser._id }, { profile: newProfile._id }),
                  Profile.updateOne({ _id: newProfile._id }, { user: newUser._id }),
                ]);
                user=newUser;
              }
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
        callbackURL:process.env.CLIENT_URL+"/auth/github/callback"
        },
        async (accessToken, refreshToken, profile, done) => {
        try{
            const githubid=profile.id;
            let user =await User.findOne({githubid});
            if(!user)
            {
              const result = await cloudinary.uploader.upload(profile.photos[0].value, {
                folder: "profile",
                type: "authenticated",  // Private upload
                format: "webp",         // Best compression
                transformation: [
                    { width: 100, height: 100, crop: "fill" },  // Exact dimensions, crop to fit
                    { quality: "auto:low" },                   // Lower quality for better compression
                    { fetch_format: "auto" }                   // Use best format (WebP, JPEG)
                ]
            });
                const photo =result.secure_url;
                const displayName=profile.displayName;
                const username=await UniqueUsername(displayName);
                const [newUser, newProfile] = await Promise.all([
                  User.create({ githubid, photo, displayName, verifiedEmail: false, username }),
                  Profile.create({})
              ]);
              await Promise.all([ 
                User.updateOne({ _id: newUser._id }, { profile: newProfile._id }),
                Profile.updateOne({ _id: newProfile._id }, { user: newUser._id }),
              ]);
              user=newUser;
            }
            return done(null, user);
        }catch(e){
            return done(e);
        }
        }
))

// Serialize user (store user ID in session)
passport.serializeUser((user, done) => {
  done(null, user.id);});

// Deserialize user (retrieve user from DB using stored ID)l
passport.deserializeUser(async (id, done) => {done(null,{id});});//only user.id will be available do all lookup based on that 
module.exports=passport;
  