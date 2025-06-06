const express = require("express");
const routes = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const insightRoutes=require("./insightRoutes");
routes.get("/enrolled-courses", enrollmentController.getEnrolledCourses);
routes.get("/completed-pages", enrollmentController.getProgress);
routes.get("/stats", enrollmentController.getStats);
routes.get("/:enrollmentId",enrollmentController.getEnrollment);
routes.use("/insight",insightRoutes)
routes.patch("/progress/push", enrollmentController.pushProgress);
routes.patch("/progress/pull", enrollmentController.pullProgress);
routes.post("/:courseId/enroll", enrollmentController.enroll);
routes.post("/:enrollmentId/verify-payment", enrollmentController.verifyPayment);
routes.delete("/:enrollmentId", enrollmentController.removeEnrollment);

module.exports = routes;
