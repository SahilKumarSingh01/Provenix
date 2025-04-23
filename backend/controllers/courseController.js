const createCourse = require("./course/createCourse");
const getCourseDetails = require("./course/getCourseDetails");
const updateDetails = require("./course/updateDetails");
const publishCourse = require("./course/publishCourse");
const recoverCourse = require("./course/recoverCourse");
const draftCourse = require("./course/draftCourse");
const reportCourse =require('./course/reportCourse')
const removeCourse = require("./course/removeCourse");
const getCreatedCourses = require("./course/getCreatedCourses");
const searchCourses = require("./course/searchCourses");
const getStats     =require('./course/getStats')
// Export Controllers
module.exports = {
  createCourse,
  getCourseDetails,
  updateDetails,
  removeCourse,
  getCreatedCourses,
  searchCourses,
  publishCourse,
  recoverCourse,
  draftCourse,
  getStats,
  reportCourse,
};
