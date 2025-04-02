const express = require('express');
const moduleController = require('../controllers/moduleController.js');

const routes = express.Router({ mergeParams: true });

routes.post('/create',moduleController.createModule);
routes.get('/collection',moduleController.getCollection);
routes.put('/reorder',moduleController.reorderModule);
routes.put('/update',moduleController.updateModule);
routes.delete('/remove',moduleController.removeModule);

module.exports = routes;

