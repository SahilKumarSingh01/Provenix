const ContentSection = require("../../models/ContentSection");
const canEditText = require("../../utils/canEditText");
const Enrollment = require("../../models/Enrollment");
const Course = require("../../models/Course");

// Create a new code block inside items[]
const create = async (req, res) => {
  try {
    const { contentSectionId ,courseId} = req.params;
    const creatorId = req.user.id;

    const newItem = { type: "code", data: [{ lang: "lang", code: "Start writing code here..." }] };

    // Find and update while returning the updated document
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId,courseId, creatorId, status: "active" },
      { $push: { items: newItem } },
      { new: true, projection: { "items": { $slice: -1 } } } // Return only the last added item
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }
    await Course.updateOne({ _id: courseId }, { $inc: { codeCount: +1 } }) // Decrement video count

    res.status(201).json({ success: true, message: "Code block added successfully", newItem: updatedSection.items[0] });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const remove = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId } = req.body;
    const creatorId = req.user.id;

    // Check if active enrollments exist before modifying content
    const activeEnrollment = await Enrollment.exists({ course: courseId, status: "active" });
    if (activeEnrollment) {
      return res.status(403).json({ message: "Cannot remove code block. Active enrollments exist." });
    }

    // Find and remove the item, returning the original document
    const contentSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active", "items._id": itemId, "items.type": "code" },
      { $pull: { items: { _id: itemId } } },
      { projection: { "items.$": 1 } } // Only return the matched item before deletion
    );

    if (!contentSection || !contentSection.items.length) {
      return res.status(404).json({ message: "Content section not found, unauthorized, or code block doesn't exist" });
    }

    const decrementValue = contentSection.items[0].data.length || 0;

    // Update the `codeCount` in the course schema
    await Course.updateOne({ _id: courseId }, { $inc: { codeCount: -decrementValue } });

    res.status(200).json({ success: true, message: "Code block removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// Push a new language entry inside a code block
const push = async (req, res) => {
  try {
    const { contentSectionId,courseId } = req.params;
    const { itemId, } = req.body;
    const creatorId = req.user.id;
    const lang ="lang here...";
    const code ="code here...";
    // Push new language code to the specified code block in a single query
    const { modifiedCount } = await ContentSection.updateOne(
      { _id: contentSectionId, courseId,creatorId, status: "active", "items._id": itemId, "items.type": "code" },
      { $push: { "items.$.data": { lang, code } } }
    );

    if (!modifiedCount) {
      return res.status(404).json({ message: "Content section or code block not found or unauthorized" });
    }
    await Course.updateOne({ _id: courseId }, { $inc: { codeCount: +1 } }) // Decrement video count
    
    res.status(200).json({ success: true, message: "New language added successfully", newItem: { lang, code } });

  } catch (error) {
    console.error("Error adding language to code block:", error);
    res.status(500).json({ message: error.message });
  }
};


const reorder = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, index1, index2 } = req.body;
    const creatorId = req.user.id;

    if (index1 === index2) {
      return res.status(400).json({ message: "Indexes are the same, no change needed" });
    }

    // Fetch only the specific item's data array
    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId, status: "active", "items._id": itemId },
      { "items.$": 1 }
    );

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const item = contentSection.items[0];
    if (!item || !item.data || index1 < 0 || index2 < 0 || index1 >= item.data.length || index2 >= item.data.length) {
      return res.status(400).json({ message: "Invalid indexes" });
    }

    // Swap the items in the array
    [item.data[index1], item.data[index2]] = [item.data[index2], item.data[index1]];

    // Update the document
    await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId },
      { $set: { "items.$.data": item.data } }
    );

    res.status(200).json({ success: true, message: "Items reordered successfully" ,newItem:item});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Edit an existing language entry inside a code block
const edit = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId, index, lang, code } = req.body;
    const creatorId = req.user.id;

    if (typeof lang !== "string" || typeof code !== "string") {
      return res.status(400).json({ message: "Invalid data type. 'lang' and 'code' must be strings." });
    }
    
    const [contentSection, activeEnrollment] = await Promise.all([
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "code" ,status: "active"},
        { "items.$": 1 } // Fetch only the matched item
      ),
      Enrollment.exists({ course: courseId, status: "active" })
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    const codeBlock = contentSection.items[0]?.data[index];
    if (!codeBlock) {
      return res.status(404).json({ message: "Code entry not found" });
    }

    // Check edit restrictions if active enrollment exists
    if (activeEnrollment && !canEditText(`${codeBlock.lang} ${codeBlock.code}`, `${lang} ${code}`)) {
      return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
    }

    // Perform the update
    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "code" },
      { 
        $set: {
          [`items.$.data.${index}.lang`]: lang,
          [`items.$.data.${index}.code`]: code
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to update code entry" });
    }

    res.json({ success: true, message: "Code updated successfully", newItem: { lang, code } });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Pull (delete) a language entry from a code block
const pull = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, index } = req.body;

    // Batch check for active enrollment and content section existence
    const [activeEnrollment, contentSection] = await Promise.all([
      Enrollment.exists({ contentSection: contentSectionId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, "items._id": itemId, "items.type": "code", status: "active" },
        { "items.$": 1 } // Fetch only the matched item
      )
    ]);

    if (activeEnrollment) {
      return res.status(403).json({ message: "Cannot modify content with active enrollments" });
    }

    if (!contentSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    // Extract the code data array
    const codeData = contentSection.items[0]?.data;
    if (!codeData || index < 0 || index >= codeData.length) {
      return res.status(404).json({ message: "Code entry not found" });
    }

    // Remove the specific index
    codeData.splice(index, 1);

    // Perform the update
    const result = await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId, "items.type": "code" },
      { $set: { "items.$.data": codeData } }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to delete code entry" });
    }
    await Course.updateOne({ _id: courseId }, { $inc: { codeCount: -1 } }) // Decrement video count
    res.json({ success: true, message: "Code language deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { create, remove, push,reorder, edit, pull };
