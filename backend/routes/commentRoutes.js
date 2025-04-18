const express = require("express");
const commentController = require("../controllers/commentController.js");

const routes = express.Router({ mergeParams: true });

routes.post("/create", commentController.create); // Create a new comment
routes.get("/all", commentController.getAll); // Get all comments 
routes.post("/report/:commentId",commentController.report);
routes.delete("/remove/:commentId", commentController.remove); // Delete a comment
routes.put("/update/:commentId", commentController.update); // Update a comment
routes.get("/get/:commentId", commentController.getComment); // Get a specific comment

module.exports = routes;
