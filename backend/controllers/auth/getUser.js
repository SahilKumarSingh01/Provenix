const User = require("../../models/User.js");
const getUser=async (req,res)=>
{
    const user=await User.findById(req?.user?.id);
    if(!user)
        return res.status(401).json({message:"session time out.."});
    res.status(200).json({user:user.getInfo()});
}
module.exports=getUser;