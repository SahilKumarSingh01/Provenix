const User = require("../../models/User.js");
const sendMail = require("../../config/sendMail.js");
require('dotenv').config();

const generateOTP = () => {
    const timeMicro=Math.floor(performance.now()*10000)%1000000;
    return timeMicro.toString().padStart(6,'0'); // Ensures a 6-digit OTP
  };
  
const OTP_EXPIRY_TIME = 10*60*1000; // Set time limit (e.g., 2 minutes)
const OTP_RESEND_TIME = 2*60*100; // Set time limit (e.g., 2 minutes)

const sendOTP = async(req,res)=>{
try{
    const {email}=req.body;
    const user=await User.findOne({email});
    if(!user)
    return res.status(400).json({success:false,message:"User not found"});
    if(user.verifiedEmail)
    return res.status(400).json({success:false,message:"email is already verified"});
    if(user.OTPSendTime+OTP_RESEND_TIME> Date.now())
    return res.status(429).json({success:false,message:`please wait for ${Math.floor((user.OTPSendTime+OTP_RESEND_TIME-Date.now())/1000)}sec`});
    verificationOTP=generateOTP();
    // console.log(process.env.SENDER_EMAIL+" "+email);
    await sendMail({
        from: process.env.SENDER_EMAIL,  // Sender email
        to: email,                   // Recipient email
        subject: "Your OTP Code",
        html: `<p>Your OTP code is: <strong>${verificationOTP}</strong></p><p>This code will expire in ${OTP_EXPIRY_TIME/(1000*60)} minutes.</p>`
    })
    await User.updateOne({email},{verificationOTP,OTPSendTime:Date.now()});
    // console.log(verificationOTP)
    return res.status(200).json({success:true,message:"opt has been sent",email});
}catch(e){
    console.log(e);
    return res.status(500).json({message:e.message});
}
};

const verifyOTP=async(req,res)=>{
    const {otp,email}=req.body;
    const user=await User.findOne({email});
    if(!user)
        return res.status(400).json({success:false,message:"User not found"});
    if(user.verifiedEmail)
        return res.status(400).json({success:false,message:"user is already verified"});
    if(user.verificationOTP!==otp)
        return res.status(400).json({success:false,message:"otp mismatch"});
    if(user.OTPSendTime+OTP_EXPIRY_TIME<Date.now())
      return res.status(429).json({success:false,message:"otp is expire"});
    user.verificationOTP=null;
    user.verifiedEmail=true;
    await user.save();
    return res.status(200).json({message:"email verified"});
};

module.exports={sendOTP,verifyOTP};