const express = require("express");
const routes = express.Router();
const enrollmentController = require("../controllers/enrollmentController");

routes.get("/enrolled-courses", enrollmentController.getEnrolledCourses);
routes.post("/:courseId/enroll", enrollmentController.enroll);
routes.post("/:enrollmentId/verify-payment", enrollmentController.verifyPayment);
routes.delete("/:enrollmentId", enrollmentController.removeEnrollment);
routes.patch("/:enrollmentId/progress/push", enrollmentController.pushProgress);
routes.patch("/:enrollmentId/progress/pull", enrollmentController.pullProgress);

module.exports = routes;
