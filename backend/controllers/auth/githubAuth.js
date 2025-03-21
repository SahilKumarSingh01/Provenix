const passport=require('../../config/passport.js');
require('dotenv').config();

// GitHub Authentication Handler
const githubAuth = passport.authenticate("github", { scope: ["user:email"] });

// GitHub Authentication Callback Handler
const githubAuthCallback = (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    if (err) return next(err);

    // Log the user in
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.send(`
        <script>
          window.opener.location.href = "${process.env.CLIENT_URL}";
            window.close();
        </script>`
      );
    });
  })(req, res, next);
};

module.exports={githubAuth,githubAuthCallback};

