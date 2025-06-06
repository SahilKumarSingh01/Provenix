const Enrollment = require("../../models/Enrollment");

const getEnrollment = async (req, res) => {
    try{
        const {enrollmentId}=req.params;
        const enrollment=await Enrollment.findOne({_id:enrollmentId,user:req.user.id});
        if(!enrollment)
            return res.status(404).json({message:"There is no enrollment of Your with that Id"});

        res.status(200).json({message:"Enrollment Fetched successfully",enrollment});

    }catch(err){
        console.log(err);
        res.status(500).json({message:"fail to fetch enrollment",error:err})
    }
};

module.exports = getEnrollment;
