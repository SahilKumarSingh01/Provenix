const createCourse = require("./course/createCourse");
const getCourseDetails = require("./course/getCourseDetails");
const updateDetails = require("./course/updateDetails");
const publishCourse = require("./course/publishCourse");
const recoverCourse = require("./course/recoverCourse");
const removeCourse = require("./course/removeCourse");
const getCreatedCourses = require("./course/getCreatedCourses");
const searchCourses = require("./course/searchCourses");
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
  searchCourses,
  createSection,
  removeSection,
  updateSection,
  reorderSection,
  publishCourse,
  recoverCourse,
};
