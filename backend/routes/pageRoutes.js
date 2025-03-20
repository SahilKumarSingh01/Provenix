const express = require('express');
const pageController = require('../controllers/pageController.js');
const commentRoutes  = require('./commentRoutes')
const contentRoutes  = require('./contentRoutes');
const insightRoutes  = require('./insightRoutes');

const routes = express.Router({ mergeParams: true });

routes.post('/create', pageController.create);
routes.get('/all', pageController.getAll);
routes.delete('/all', pageController.removeAll);
routes.put('/reorder', pageController.reorder);
routes.use('/:pageId/comment',commentRoutes);
routes.use('/:pageId/content',contentRoutes);
routes.use('/:pageId/comment',commentRoutes);
routes.use('/:pageId/insight',insightRoutes);
routes.delete('/:pageId', pageController.remove);
routes.get('/:pageId', pageController.getPage);
routes.put('/:pageId', pageController.update);
// routes.use('/:pageId/content',contentRoutes);
module.exports = routes;

