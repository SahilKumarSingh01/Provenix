const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,  // Or use OAuth tokens for better security
  },
});
// sendEmail('sahil.kumar.singh.lol9@gmail.com','hi','how are you');
module.exports=transporter.sendMail;