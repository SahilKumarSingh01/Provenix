const express =require('express');
const courseController = require('../controllers/courseController.js');
const pageRoutes = require('./pageRoutes.js');
const reviewRoutes = require('./reviewRoutes.js');
require("dotenv").config();
const routes  =express.Router();
routes.post('/create',courseController.createCourse);
routes.get('/created-courses',courseController.getCreatedCourses);
routes.get('/search',courseController.searchCourses);//use skip and limit for dynamic searching 
routes.put('/:courseId/publish',courseController.publishCourse);
routes.put('/:courseId/recover',courseController.recoverCourse);

routes.post('/:courseId/create-section',courseController.createSection);
routes.put('/:courseId/update-section',courseController.updateSection);
routes.put('/:courseId/reorder-section',courseController.reorderSection);
routes.delete('/:courseId/remove-section',courseController.removeSection);

routes.use('/:courseId/review',reviewRoutes);
routes.use('/:courseId/page',pageRoutes);//check if authorize then pass
routes.delete('/:courseId',courseController.removeCourse);
routes.get('/:courseId',courseController.getCourseDetails);
routes.put('/:courseId',courseController.updateDetails);


module.exports=routes;