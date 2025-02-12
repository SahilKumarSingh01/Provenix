const Resend=require('resend').Resend;
const resend = new Resend(process.env.RESEND_API_KEY);
module.exports=resend;
// (async()=>{
//   let res=await resend.emails.send({
//     from: 'provenix@resend.dev',
//     to: 'provenixcreator@gmail.com',
//     subject: 'Hello World',
//     html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
//   });
//   console.log(res);
// })()