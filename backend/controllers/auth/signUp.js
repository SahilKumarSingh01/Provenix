const bcrypt = require("bcrypt");
const User = require("../../models/User.js");
const signUp = async (req,res)=>{
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
};

module.exports={signUp};