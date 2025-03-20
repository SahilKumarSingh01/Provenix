const enroll = require("./enrollment/enroll");
const getEnrolledCourses = require("./enrollment/getEnrolledCourses");
const verifyPayment = require("./enrollment/verifyPayment");
const removeEnrollment = require("./enrollment/removeEnrollment");
const pushProgress  =require('./enrollment/pushProgress');
const pullProgress  =require('./enrollment/pullProgress');

module.exports = {
  enroll,
  getEnrolledCourses,
  verifyPayment,
  pushProgress,
  pullProgress,
  removeEnrollment,
};
