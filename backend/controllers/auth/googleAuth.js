const passport=require('../../config/passport.js');
require('dotenv').config();
// Google Authentication Handler
const googleAuth = passport.authenticate("google", { scope: ["email", "profile"] });

// Google Authentication Callback Handler
const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect(process.env.CLIENT_URL+"/login");

    // Log the user in
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect(process.env.CLIENT_URL);
    });
  })(req, res, next);
};

module.exports={googleAuth,googleAuthCallback};