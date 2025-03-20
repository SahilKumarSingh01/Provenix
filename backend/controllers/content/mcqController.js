const OrphanResource = require("../../models/OrphanResource");
const ContentSection = require("../../models/ContentSection");
const cloudinary = require("../../config/cloudinary");
const canEditText = require("../../utils/canEditText");

const IMAGE_EXPIRY_TIME = 5 * 60 * 60;


const create = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const creatorId = req.user.id;

    // Default MCQ template
    const mcqTemplate = {
      type: "mcq",
      data: {
        ques: { text: "Write your question here..." },
        options: [
          { text: "Write option here..." },
          { text: "Write option here..." }
        ],
      },
    };

    // Add MCQ template to content section
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, status: "active" },
      { $push: { items: mcqTemplate } },
      { new: true, projection: { "items.$": 1 } } // Return only the newly added item
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Content section not found or unauthorized" });
    }

    res.status(201).json({
      success: true,
      message: "MCQ template added successfully",
      newItem: updatedSection.items[0],
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const addOption = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId } = req.body;
    const creatorId = req.user.id;

    // Default option template
    const newOption = { text: "Write option here..." };

    // Update the specific MCQ item by pushing a new option
    const updatedSection = await ContentSection.findOneAndUpdate(
      { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "mcq", status: "active" },
      { $push: { "items.$.data.options": newOption } },
      { new: true, projection: { "items.$": 1 } } // Return only the updated item
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "MCQ item not found or unauthorized" });
    }

    res.status(201).json({
      success: true,
      message: "Option added successfully",
      newItem: updatedSection.items[0], // Updated MCQ item
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const removeOption = async (req, res) => {
  try {
    const { contentSectionId } = req.params;
    const { itemId, index } = req.body;
    const creatorId = req.user.id;

    // Find the MCQ item first to get the option details
    const contentSection = await ContentSection.findOne(
      { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "mcq", status: "active" },
      { "items.$": 1 }
    );

    if (!contentSection) {
      return res.status(404).json({ message: "MCQ item not found or unauthorized" });
    }

    const mcqItem = contentSection.items[0];

    // Validate index
    if (index < 0 || index >= mcqItem.data.options.length) {
      return res.status(400).json({ message: "Invalid index" });
    }

    // Extract the option to be removed
    const [removedOption] = mcqItem.data.options.splice(index, 1);

    // Update the database with the modified options array
    await ContentSection.updateOne(
      { _id: contentSectionId, "items._id": itemId },
      { $set: { "items.$.data.options": mcqItem.data.options } }
    );

    // If the removed option has a publicId, add it to OrphanResource
    if (removedOption.publicId) {
      await OrphanResource.create({publicId: removedOption.publicId,type: "image",category: "pageImage"});
    }

    res.json({ success: true, message: "Option removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshUrlQues = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId } = req.body;
    const userId = req.user.id;

    // Check if user is creator or enrolled
    const [contentSection, isEnrolled] = await Promise.all([
      ContentSection.findOne(
        { _id: contentSectionId, "items._id": itemId, "items.type": "mcq", status: "active" },
        { "items.$": 1, creatorId: 1 }
      ),
      Enrollment.exists({ course: courseId, user: userId, status: "active" })
    ]);

    if (!contentSection || (!contentSection.creatorId.equals(userId) && !isEnrolled)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const publicId = contentSection.items[0].data.ques.publicId;
    if (!publicId) return res.status(400).json({ message: "No image associated with this MCQ" });

    const url = cloudinary.utils.signed_url(publicId, {
      type: "authenticated",
      resource_type: "image",
      format: "webp",
      expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
    });

    res.json({ success: true, message: "URL refreshed", url });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editQues = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId, text, publicId } = req.body;
    const creatorId = req.user.id;

    if (typeof text !== "string" || (publicId && typeof publicId !== "string")) {
      return res.status(400).json({ message: "Invalid text or publicId" });
    }

    const [orphanExists, activeEnrollmentExists, contentSection] = await Promise.all([
      publicId ? OrphanResource.exists({ publicId, type: "image", category: "pagePhoto" }) : null,
      Enrollment.exists({ course: courseId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "mcq", status: "active" },
        { "items.$": 1 }
      ),
    ]);

    if (!contentSection) return res.status(404).json({ message: "MCQ not found or unauthorized" });

    const existingItem = contentSection.items[0];

    // Check if editing text is allowed
    if (activeEnrollmentExists && !canEditText(existingItem.data.ques.text, text)) {
      return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
    }

    if (publicId && existingItem.data.ques.publicId !== publicId && !orphanExists) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const [updatedSection] = await Promise.all([
      ContentSection.findOneAndUpdate(
        { _id: contentSectionId, "items._id": itemId },
        { $set: { "items.$.data.ques": { text, publicId } } },
        { new: true, projection: { "items.$": 1 } }
      ),
      publicId && existingItem.data.ques.publicId !== publicId
        ? OrphanResource.bulkWrite([
            { insertOne: { document: { publicId: existingItem.data.ques.publicId, type: "image", category: "pagePhoto" } } },
            { deleteOne: { filter: { publicId, type: "image", category: "pagePhoto" } } },
          ])
        : Promise.resolve(),
    ]);

    // Generate signed URL if publicId is present
    const url = publicId
      ? cloudinary.utils.signed_url(publicId, {
          type: "authenticated",
          resource_type: "image",
          format: "webp",
          expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
        })
      : null;

    const newItem=updatedSection.items[0];
  
    newItem.data.ques.url = url;// Include signed URL if available
    res.json({
      success: true,
      message: "MCQ updated successfully",
      newItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const refreshUrlOption = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId, optionIndex } = req.body;
    const userId = req.user.id;

    if (!Number.isInteger(optionIndex) || optionIndex < 0) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // Check if user is creator or enrolled
    const [contentSection, isEnrolled] = await Promise.all([
      ContentSection.findOne(
        { _id: contentSectionId, "items._id": itemId, "items.type": "mcq", status: "active" },
        { "items.$": 1, creatorId: 1 }
      ),
      Enrollment.exists({ course: courseId, user: userId, status: "active" }),
    ]);

    if (!contentSection || (!contentSection.creatorId.equals(userId) && !isEnrolled)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const existingItem = contentSection.items[0];

    if (optionIndex >= existingItem.data.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    const publicId = existingItem.data.options[optionIndex].publicId;
    if (!publicId) return res.status(400).json({ message: "No image associated with this option" });

    const url = cloudinary.utils.signed_url(publicId, {
      type: "authenticated",
      resource_type: "image",
      format: "webp",
      expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
    });

    res.json({ success: true, message: "URL refreshed", url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const editOption = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId, optionIndex, text, publicId, isCorrect } = req.body;
    const creatorId = req.user.id;

    if (!Number.isInteger(optionIndex) || optionIndex < 0) {
      return res.status(400).json({ message: "Invalid option index" });
    }
    if (typeof text !== "string" || (publicId && typeof publicId !== "string")) {
      return res.status(400).json({ message: "Invalid text or publicId" });
    }

    // Convert isCorrect to boolean
    const isCorrectBoolean = Boolean(isCorrect);

    const [orphanExists, activeEnrollmentExists, contentSection] = await Promise.all([
      publicId ? OrphanResource.exists({ publicId, type: "image", category: "pagePhoto" }) : null,
      Enrollment.exists({ course: courseId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "mcq", status: "active" },
        { "items.$": 1 }
      ),
    ]);

    if (!contentSection) return res.status(404).json({ message: "MCQ not found or unauthorized" });

    const existingItem = contentSection.items[0];

    if (optionIndex >= existingItem.data.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // Check if editing the option text is allowed
    if (activeEnrollmentExists && !canEditText(existingItem.data.options[optionIndex].text, text)) {
      return res.status(403).json({ message: "Edit limit exceeded. Only minor changes allowed." });
    }

    if (publicId && existingItem.data.options[optionIndex].publicId !== publicId && !orphanExists) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const [updatedSection] = await Promise.all([
      ContentSection.findOneAndUpdate(
        { _id: contentSectionId, "items._id": itemId },
        { $set: { [`items.$.data.options.${optionIndex}`]: { text, publicId, isCorrect: isCorrectBoolean } } },
        { new: true, projection: { "items.$": 1 } }
      ),
      publicId && existingItem.data.options[optionIndex].publicId !== publicId
        ? OrphanResource.bulkWrite([
            { insertOne: { document: { publicId: existingItem.data.options[optionIndex].publicId, type: "image", category: "pagePhoto" } } },
            { deleteOne: { filter: { publicId, type: "image", category: "pagePhoto" } } },
          ])
        : Promise.resolve(),
    ]);

    // Generate signed URL if publicId is present
    const url = publicId
      ? cloudinary.utils.signed_url(publicId, {
          type: "authenticated",
          resource_type: "image",
          format: "webp",
          expires_at: Math.floor(Date.now() / 1000) + IMAGE_EXPIRY_TIME,
        })
      : null;

    const newItem = updatedSection.items[0];
    newItem.data.options[optionIndex].url = url;

    res.json({
      success: true,
      message: "Option updated successfully",
      newItem
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const remove = async (req, res) => {
  try {
    const { contentSectionId, courseId } = req.params;
    const { itemId } = req.body;
    const creatorId = req.user.id;

    // Run both queries in parallel for efficiency
    const [activeEnrollmentExists, contentSection] = await Promise.all([
      Enrollment.exists({ course: courseId, status: "active" }),
      ContentSection.findOne(
        { _id: contentSectionId, creatorId, "items._id": itemId, "items.type": "mcq" },
        { "items.$": 1 } // Fetch the item before deletion
      ),
    ]);

    if (!contentSection) {
      return res.status(404).json({ message: "MCQ not found or unauthorized" });
    }

    if (activeEnrollmentExists) {
      return res.status(403).json({ message: "Modification not allowed. Active enrollments exist." });
    }

    const existingItem = contentSection.items[0];

    // Collect all publicIds from the question and options
    const orphanEntries = [];

    if (existingItem.data.ques.publicId) {
      orphanEntries.push({
        publicId: existingItem.data.ques.publicId,
        type: "image",
        category: "pagePhoto",
      });
    }

    for (const option of existingItem.data.options) {
      if (option.publicId) {
        orphanEntries.push({
          publicId: option.publicId,
          type: "image",
          category: "pagePhoto",
        });
      }
    }

    await Promise.all([
      // Remove the MCQ item
      ContentSection.updateOne(
        { _id: contentSectionId },
        { $pull: { items: { _id: itemId } } }
      ),

      // Insert orphan entries in bulk if there are any
      orphanEntries.length > 0 ? OrphanResource.insertMany(orphanEntries) : Promise.resolve(),
    ]);

    res.json({ success: true, message: "MCQ removed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = { create ,addOption,removeOption,refreshUrlQues,editQues,editOption,refreshUrlOption,remove};
