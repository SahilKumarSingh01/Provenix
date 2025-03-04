const passport=require('../../config/passport.js');

  const login =(req, res, next) => {
      passport.authenticate("local", (err, user, info) => {
          if (err) return res.status(500).json({ message: "Server error" });
          if (!user) return res.status(401).json({ message: info.message }); // Read error message from `done()`
          
          req.logIn(user, (err) => {
              if (err) return res.status(500).json({ message: "Login failed" });
              res.json({ message: "Login successful" ,user:user.getInfo()});
          });
      })(req, res, next);
  }

  const logout=(req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logout successful" });
    });
  }
module.exports={login,logout};