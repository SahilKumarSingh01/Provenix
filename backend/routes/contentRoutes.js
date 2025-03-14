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
routes.put('/:contentSectionId',contentController.reorder);


// Heading Routes
routes.post('/:contentSectionId/heading', headingController.create);
routes.put('/:contentSectionId/heading', headingController.update);
routes.delete('/:contentSectionId/heading', headingController.remove);

// Text Routes
routes.post('/:contentSectionId/text', textController.create);
routes.put('/:contentSectionId/text', textController.update);
routes.delete('/:contentSectionId/text', textController.remove);

// code Routes
routes.post('/:contentSectionId/code', codeController.create);
routes.put('/:contentSectionId/code', codeController.reorder);
routes.put('/:contentSectionId/code/push', codeController.push);
routes.put('/:contentSectionId/code/edit', codeController.edit);
routes.put('/:contentSectionId/code/pull', codeController.pull);
routes.delete('/:contentSectionId/code', codeController.remove);

// Image Routes
routes.post('/:contentSectionId/image', imageController.create);
routes.get('/:contentSectionId/image', imageController.refreshUrl);
routes.put('/:contentSectionId/image', imageController.update);
routes.delete('/:contentSectionId/image', imageController.remove);

// Video Routes
routes.post('/:contentSectionId/video', videoController.create);
routes.get('/:contentSectionId/video', videoController.refreshUrl);
routes.put('/:contentSectionId/video', videoController.update);
routes.delete('/:contentSectionId/video', videoController.remove);

// MCQ Routes
routes.post("/:contentSectionId/mcq", mcqController.create);
routes.post("/:contentSectionId/mcq/option", mcqController.addOption);
routes.delete("/:contentSectionId/mcq/option", mcqController.removeOption);
routes.get("/:contentSectionId/mcq/ques/url", mcqController.refreshUrlQues);
routes.put("/:contentSectionId/mcq/ques", mcqController.editQues);
routes.put("/:contentSectionId/mcq/option", mcqController.editOption);
routes.get("/:contentSectionId/mcq/option/url", mcqController.refreshUrlOption);
routes.delete("/:contentSectionId/mcq", mcqController.remove);

// Hidden Routes
routes.post('/:contentSectionId/hidden', hiddenController.create);
routes.put('/:contentSectionId/hidden', hiddenController.update);
routes.delete('/:contentSectionId/hidden', hiddenController.remove);

// Reference Routes
routes.post('/:contentSectionId/reference', referenceController.create);
routes.put('/:contentSectionId/reference', referenceController.update);
routes.delete('/:contentSectionId/reference', referenceController.remove);

module.exports = routes;
