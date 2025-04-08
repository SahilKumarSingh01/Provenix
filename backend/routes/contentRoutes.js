const express = require("express");

const contentController = require("../controllers/contentController.js")
const headingController = require("../controllers/content/headingController.js");
const textController = require("../controllers/content/textController.js");
const codeController = require("../controllers/content/codeController.js");
const imageController = require("../controllers/content/imageController.js");
const videoController = require("../controllers/content/videoController.js");
const mcqController = require("../controllers/content/mcqController.js");
const hiddenController = require("../controllers/content/hiddenController.js");
const referenceController = require("../controllers/content/referenceController.js");

const routes = express.Router({ mergeParams: true });

//contents Routes
routes.put('/reorder',contentController.reorder);
routes.get('/collection',contentController.getContent);

// Heading Routes
routes.post('/heading', headingController.create);
routes.put('/heading', headingController.update);
routes.delete('/heading', headingController.remove);

// Text Routes
routes.post('/text', textController.create);
routes.put('/text', textController.update);
routes.delete('/text', textController.remove);

// code Routes
routes.post('/code', codeController.create);
routes.put('/code', codeController.update);
routes.delete('/code', codeController.remove);

// Image Routes
routes.post('/image', imageController.create);
routes.put('/image', imageController.update);
routes.delete('/image', imageController.remove);

// Video Routes
routes.post('/video', videoController.create);
routes.get('/video', videoController.refreshUrl);
routes.put('/video', videoController.update);
routes.delete('/video', videoController.remove);

// MCQ Routes
routes.post("/mcq", mcqController.create); 
routes.put("/mcq", mcqController.update);
routes.delete("/mcq", mcqController.remove);

// Hidden Routes
routes.post('/hidden', hiddenController.create);
routes.put('/hidden', hiddenController.update);
routes.delete('/hidden', hiddenController.remove);

// Reference Routes
routes.post('/reference', referenceController.create);
routes.put('/reference', referenceController.update);
routes.delete('/reference', referenceController.remove);

module.exports = routes;
