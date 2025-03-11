const express = require('express');
const pageController = require('../controllers/pageController.js');

const routes = express.Router({ mergeParams: true });

routes.post('/create', pageController.create);
routes.get('/all', pageController.getAll);
routes.delete('/all', pageController.removeAll);
routes.put('/reorder', pageController.reorder);
routes.delete('/:pageId', pageController.remove);
routes.put('/:pageId', pageController.update);

module.exports = routes;

