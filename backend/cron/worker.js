const cron = require("node-cron");
const connectDatabase = require("../utils/connectDatabase");
const expireOldEnrollments = require("./tasks/expireOldEnrollments");
const removeOrphanEntries = require("./tasks/removeOrphanResource");
const removeDeletedContentSections = require("./tasks/removeDeletedContentSections");
const removeDeletedCourses = require("./tasks/removeDeletedCourses");

(async () => {
  try {
    await connectDatabase();
    console.log("Database connected. Starting cron jobs...");

    cron.schedule("0 * * * *", async () => {
      console.log("Running cron worker...");
      try {
        await expireOldEnrollments();
        await removeOrphanEntries();
        await removeDeletedContentSections();
        await removeDeletedCourses();
      } catch (error) {
        console.error("Cron job failed:", error);
      }
    });

    console.log("Cron worker initialized.");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1); // Exit process if database connection fails
  }
})();
