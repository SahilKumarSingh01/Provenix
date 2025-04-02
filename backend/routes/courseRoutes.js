const express =require('express');
const courseController = require('../controllers/courseController.js');
const moduleRoutes=require('./moduleRoutes.js')
const pageRoutes = require('./pageRoutes.js');
const reviewRoutes = require('./reviewRoutes.js');
require("dotenv").config();
const routes  =express.Router();
routes.post('/create',courseController.createCourse);
routes.get('/created-courses',courseController.getCreatedCourses);
routes.get('/search',courseController.searchCourses);//use skip and limit for dynamic searching 
routes.use('/module/:moduleCollectionId',moduleRoutes);
routes.use('/page/:pageCollectionId',pageRoutes);//check if authorize then pass
routes.use('/:courseId/review',reviewRoutes);
routes.delete('/:courseId',courseController.removeCourse);
routes.get('/:courseId',courseController.getCourseDetails);
routes.put('/:courseId',courseController.updateDetails);
routes.put('/:courseId/publish',courseController.publishCourse);
routes.put('/:courseId/recover',courseController.recoverCourse);
routes.put('/:courseId/draft',courseController.draftCourse);


module.exports=routes;