const mongoose=require('mongoose');
const session =require('express-session');
const cors    =require('cors');
const mongoStore=require('connect-mongo');
mongoose.connect(process.env.MONGO_URI).then(()=>{console.log("mongodb is connected");}).catch((e)=>{console.log(e.message);});

(async () => {
    console.log("This runs immediately!");
})();
  