const enroll = require("./enrollment/enroll");
const getEnrolledCourses = require("./enrollment/getEnrolledCourses");
const verifyPayment = require("./enrollment/verifyPayment");
const removeEnrollment = require("./enrollment/removeEnrollment");
const pushProgress  =require('./enrollment/pushProgress');
const pullProgress  =require('./enrollment/pullProgress');
const getProgress   =require('./enrollment/getProgress')
const getStats=require('./enrollment/getStats')
module.exports = {
  enroll,
  getEnrolledCourses,
  getProgress,
  verifyPayment,
  pushProgress,
  pullProgress,
  removeEnrollment,
  getStats,
};
