const express = require('express');
const reviewController = require('../controllers/reviewController.js');

const routes = express.Router({ mergeParams: true });

routes.post('/create', reviewController.create);
routes.get('/all', reviewController.getAll);
routes.get('/my-review', reviewController.myReview);
routes.post('/report/:reviewId', reviewController.report);
routes.delete('/:reviewId', reviewController.remove);
routes.put('/:reviewId', reviewController.update);

module.exports = routes;

