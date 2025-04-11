const express = require("express");
const insightController = require("../controllers/insightController");

const router = express.Router({ mergeParams: true });

// InsightSection routes
router.get("/:contentSectionId", insightController.getInsight);
router.put("/:insightSectionId", insightController.updateInsight);

module.exports = router;
