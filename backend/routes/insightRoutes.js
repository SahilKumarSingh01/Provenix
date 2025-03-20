const express = require("express");
const { edit, getInsights } = require("../controllers/insightController");

const router = express.Router({ mergeParams: true });

// InsightSection routes
router.get("/:contentSectionId", getInsights);
router.put("/:contentSectionId", edit);

module.exports = router;
