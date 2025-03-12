const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/uploadController.js');

const routes = express.Router({ mergeParams: true });

// Multer Configuration
const storage = multer.memoryStorage(); // Keeping files in memory before processing
const upload = multer({ storage });

routes.post('/profile', upload.single('file'), uploadController.uploadProfile);
// routes.post('/thumbnail', upload.single('file'), uploadController.uploadThumbnail);
// routes.post('/page-photo', upload.single('file'), uploadController.pagePhoto);
// routes.post('/page-video', upload.single('file'), uploadController.pageVideo);

module.exports = routes;
