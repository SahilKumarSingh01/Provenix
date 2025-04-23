const express =require('express');
const courseController = require('../controllers/courseController.js');
const moduleRoutes=require('./moduleRoutes.js')
const pageRoutes = require('./pageRoutes.js');
const reviewRoutes = require('./reviewRoutes.js');
const contentRoutes  = require('./contentRoutes');
const isAuthenticated=require('../middlewares/authMiddleware.js')
require("dotenv").config();
const routes  =express.Router();
routes.post('/create',isAuthenticated,courseController.createCourse);
routes.get('/created-courses',isAuthenticated,courseController.getCreatedCourses);
routes.get('/stats',isAuthenticated,courseController.getStats)
routes.post('/search',courseController.searchCourses);//use skip and limit for dynamic searching 

routes.use('/module/:moduleCollectionId',moduleRoutes);
routes.use('/page/:pageCollectionId',pageRoutes);//check if authorize then pass
routes.use('/content/:contentSectionId',isAuthenticated,contentRoutes);
routes.use('/:courseId/review',reviewRoutes);

routes.delete('/:courseId',isAuthenticated,courseController.removeCourse);
routes.get('/:courseId',courseController.getCourseDetails);
routes.put('/:courseId',isAuthenticated,courseController.updateDetails);
routes.put('/:courseId/publish',isAuthenticated,courseController.publishCourse);
routes.put('/:courseId/recover',isAuthenticated,courseController.recoverCourse);
routes.put('/:courseId/draft',isAuthenticated,courseController.draftCourse);
routes.put('/:courseId/report',isAuthenticated,courseController.reportCourse);



module.exports=routes;