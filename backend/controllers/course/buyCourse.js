const Course = require("../../models/Course"); 
const Enrollment=require('../../models/Enrollment');
const buyCourse = async (req, res) => {
    try {
      // TODO: Implement payment logic
      res.status(200).json({ success: true, message: "Payment logic goes here" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};
module.exports=buyCourse;