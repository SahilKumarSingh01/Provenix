
const expireOldEnrollments = require("./tasks/expireOldEnrollments");
const removeOrphanEntries = require("./tasks/removeOrphanResource");
const removeDeletedCourses = require("./tasks/removeDeletedCourses");

// Function to run tasks (named worker)
const worker = async () => {
  try {
    // You can skip database connection here if it's already connected in app.js
    console.log("Running worker tasks...");

    // Run tasks
    await expireOldEnrollments();
    await removeOrphanEntries();
    await removeDeletedCourses();

    console.log("Worker tasks completed.");
  } catch (error) {
    console.error("Error in running worker tasks:", error);
  }
};

module.exports = worker;
