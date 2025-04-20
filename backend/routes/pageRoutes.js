const express = require('express');
const pageController = require('../controllers/pageController.js');
const commentRoutes  = require('./commentRoutes')
const insightRoutes  = require('./insightRoutes');
const isAuthenticated=require('../middlewares/authMiddleware.js')

const routes = express.Router({ mergeParams: true });

routes.post('/create',isAuthenticated, pageController.create);
routes.get('/collection', pageController.getCollection);
routes.put('/reorder',isAuthenticated, pageController.reorder);
routes.use('/comment/:pageId',commentRoutes);
routes.use('/insight/:pageId',isAuthenticated,insightRoutes);
routes.delete('/remove',isAuthenticated, pageController.remove);
routes.put('/update',isAuthenticated, pageController.update);
// routes.use('/:pageId/content',contentRoutes);
module.exports = routes;

