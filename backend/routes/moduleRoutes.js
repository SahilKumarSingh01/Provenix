const express = require('express');
const moduleController = require('../controllers/moduleController.js');
const isAuthenticated=require('../middlewares/authMiddleware.js')

const routes = express.Router({ mergeParams: true });

routes.post('/create',isAuthenticated,moduleController.createModule);
routes.get('/collection',moduleController.getCollection);
routes.put('/reorder',isAuthenticated,moduleController.reorderModule);
routes.put('/update',isAuthenticated,moduleController.updateModule);
routes.delete('/remove',isAuthenticated,moduleController.removeModule);

module.exports = routes;

