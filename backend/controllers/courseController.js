const createCourse = require("./course/createCourse");
const getCourseDetails = require("./course/getCourseDetails");
const updateDetails = require("./course/updateDetails");
const removeCourse = require("./course/removeCourse");
const getCreatedCourses = require("./course/getCreatedCourses");
const getEnrolledCourses = require("./course/getEnrolledCourses");
const searchCourses = require("./course/searchCourses");
const buyCourse = require("./course/buyCourse");
const createSection = require("./course/createSection");
const updateSection = require("./course/updateSection");
const removeSection = require("./course/removeSection");
const reorderSection = require("./course/reorderSection");
// Export Controllers
module.exports = {
  createCourse,
  getCourseDetails,
  updateDetails,
  removeCourse,
  getCreatedCourses,
  getEnrolledCourses,
  searchCourses,
  buyCourse,
  createSection,
  removeSection,
  updateSection,
  reorderSection,
};
