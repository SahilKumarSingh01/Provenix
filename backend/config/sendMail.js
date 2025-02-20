const nodemailer = require('nodemailer');
require('dotenv').config();
// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_EMAIL,  
    pass: process.env.SENDER_PASSWORD,  // Or use OAuth tokens for better security
  },
});
const sendMail = async (mailOptions) => {
  return transporter.sendMail(mailOptions);
};
module.exports=sendMail;