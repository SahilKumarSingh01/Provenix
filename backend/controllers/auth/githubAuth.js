const passport=require('../config/passport.js');
require('dotenv').config();

// GitHub Authentication Handler
const githubAuth = passport.authenticate("github", { scope: ["user:email"] });

// GitHub Authentication Callback Handler
const githubAuthCallback = (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect(process.env.CLIENT_URL+"/login");

    // Log the user in
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect(process.env.CLIENT_URL);
    });
  })(req, res, next);
};

module.exports={githubAuth,githubAuthCallback};

