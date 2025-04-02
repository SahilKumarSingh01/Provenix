const express = require('express');
const pageController = require('../controllers/pageController.js');
const commentRoutes  = require('./commentRoutes')
const contentRoutes  = require('./contentRoutes');
const insightRoutes  = require('./insightRoutes');

const routes = express.Router({ mergeParams: true });

routes.post('/create', pageController.create);
routes.get('/collection', pageController.getCollection);
routes.put('/reorder', pageController.reorder);
routes.use('/comment/:pageId',commentRoutes);
routes.use('/content/:pageId',contentRoutes);
routes.use('/insight/:pageId',insightRoutes);
routes.delete('/remove', pageController.remove);
routes.put('/update', pageController.update);
// routes.use('/:pageId/content',contentRoutes);
module.exports = routes;

