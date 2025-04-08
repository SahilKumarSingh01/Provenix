const ContentSection = require("../../models/ContentSection");
const canEditText = require("../../utils/canEditText");
const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");

// Create a new code block inside items[]
const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    const newItem = { type: "code", data: [{ lang: "lang", code: "Start writing code here..." }] };

    // Find and update while returning the updated document
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: newItem } },
      { new: true } // Return only the last added item
    ).lean();

    if (!updatedSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }
    const course = await Course.findOneAndUpdate(
      { _id: updatedSection.courseId },
      { $inc: { codeCount: 1 } },
      { new: true, lean: true }
    ).select("codeCount");
    
    res.status(201).json({ 
      success: true, 
      message: "Code block added successfully", 
      items: updatedSection.items ,
      codeCount:course.codeCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    let {itemId, data, courseId} = req.body;
    const creatorId = req.user.id;
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      !data.every(
        (item) =>
          typeof item === "object" &&
          typeof item.lang === "string" &&
          typeof item.code === "string"
      )
    ) {
      return res.status(400).json({ message: "Invalid or empty data format." });
    }
    const sanitizedData = data.map(({ lang, code }) => ({ lang, code }));
    
    // Fetch old data and check active enrollment in a single batch query
    const [contentSection, activeEnrollment] = await Promise.all([
          ContentSection.findOne(
            {_id: contentSectionId, creatorId, courseId,items: { $elemMatch: { _id: itemId, type: "code" } }},
            {"items.$": 1}
          ),
          Enrollment.exists({course: courseId,status: "active"})
        ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Code block not found or unauthorized" });
    }

    const oldData = contentSection.items[0].data;

    // If active enrollment exists, apply edit restrictions
    if (activeEnrollment) {
      const oldText = JSON.stringify(oldData);
      const newText = JSON.stringify(sanitizedData);
    
      if (!canEditText(oldText, newText)) {
        return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
      }
    }
    // 1. Get the old data before update
    const fetchedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, "items._id": itemId },
      { $set: { "items.$.data": sanitizedData } },
      { new: false } // <-- old data before update
    ).lean();

    if (!fetchedSection) {
      return res.status(404).json({ message: "Update failed. No changes were made." });
    }

    // 2. Find the correct item to compare
    const fetchedData = fetchedSection.items.find(item => item._id.toString() === itemId)?.data || [];
    const diff = sanitizedData.length - fetchedData.length;

    // 3. Update course codeCount accordingly
    const course = await Course.findOneAndUpdate(
      { _id: fetchedSection.courseId },
      { $inc: { codeCount: diff } },
      { new: true }
    ).lean().select("codeCount");

    const updatedItems = fetchedSection.items.map(item => {
      if (item._id.toString() === itemId) {
        return { ...item, data: sanitizedData }; // inject new data
      }
      return item;
    });

    res.json({
      success: true,
      message: "Code block updated successfully",
      items: updatedItems, // Return the updated item
      codeCount:course.codeCount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const remove = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId ,courseId} = req.query;
    const creatorId = req.user.id;

    // Check if active enrollments exist before modifying content
    const activeEnrollment = await Enrollment.exists({ course: courseId, status: "active" });
    if (activeEnrollment) {
      return res.status(403).json({ message: "Cannot remove code block. Active enrollments exist." });
    }

    // 1. Find and remove the item (return old version before pull)
    const contentSection = await ContentSection.findOneAndUpdate(
      {
        _id: contentSectionId,
        creatorId,
        courseId,
        items: { $elemMatch: { _id: itemId, type: "code" } }
      },
      { $pull: { items: { _id: itemId } } },
      { new: false } // get previous version
    );

    if (!contentSection) {
      return res.status(404).json({
        message: "Content section not found, unauthorized, or code block doesn't exist"
      });
    }

    // 2. Find the item to remove from the old array and get code length
    const deletedItem = contentSection.items.find(
      item => item._id.toString() === itemId
    );
    const decrementValue = deletedItem?.data?.length || 0;

    // 3. Update course and get updated codeCount
    const course = await Course.findOneAndUpdate(
      { _id: courseId },
      { $inc: { codeCount: -decrementValue } },
      { new: true }
    ).lean().select("codeCount");

    // 4. Get updated item list by filtering the removed one
    const updatedItems = contentSection.items.filter(
      item => item._id.toString() !== itemId
    );

    // 5. Send final response
    res.status(200).json({
      success: true,
      message: "Code block removed successfully",
      codeCount: course.codeCount,
      items: updatedItems
    });


  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { create, remove,update };
