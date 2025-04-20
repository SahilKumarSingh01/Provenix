const express = require('express');
const reviewController = require('../controllers/reviewController.js');
const isAuthenticated=require('../middlewares/authMiddleware.js')

const routes = express.Router({ mergeParams: true });

routes.post('/create',isAuthenticated, reviewController.create);
routes.get('/all', reviewController.getAll);
routes.get('/my-review',isAuthenticated, reviewController.myReview);
routes.post('/report/:reviewId',isAuthenticated, reviewController.report);
routes.delete('/:reviewId',isAuthenticated, reviewController.remove);
routes.put('/:reviewId',isAuthenticated, reviewController.update);

module.exports = routes;

