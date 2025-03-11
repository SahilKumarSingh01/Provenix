const Course = require("../../models/Course"); 
const createCourse = async (req, res) => {
    try {
      const { title, description, category } = req.body;
      const creator = req.user.id; 
  
      const newCourse = new Course({
        title,
        description,
        category,
        creator,
      }); 
  
      await newCourse.save();
      res.status(201).json({ success: true, message: "Course created!", course: newCourse });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  module.exports=createCourse;