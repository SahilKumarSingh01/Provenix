require("dotenv").config();

const isAuthenticated=(req,res,next)=>{
    if(req.user)
        next();
    else 
        res.status(401).json({ message: "Unauthorized access. Please log in to continue." });
}
module.exports=isAuthenticated;