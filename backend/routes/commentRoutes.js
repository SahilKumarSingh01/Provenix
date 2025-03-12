const express = require("express");
const commentController = require("../controllers/commentController.js");

const routes = express.Router({ mergeParams: true });

routes.post("/create", commentController.create); // Create a new comment
routes.get("/all", commentController.getAll); // Get all comments 
routes.post("/:commentId/reply", commentController.create); // Create a reply 
routes.get("/:commentId/replies", commentController.getAll); // Get all replies for a specific comment
routes.get("/:commentId", commentController.getComment); // Get a specific comment
routes.delete("/:commentId", commentController.remove); // Delete a comment
routes.put("/:commentId", commentController.update); // Update a comment

module.exports = routes;
