const ContentSection = require("../models/ContentSection");
const Course = require("../models/Course");
const OrphanResource = require("../models/OrphanResource");


const removeContentSection = async (courseId, moduleId, contentSectionId ,isPageRemoved=false) => {
  try {
    // Prepare query based on the provided parameters
    let query = {};

    if (courseId) query.courseId = courseId;
    if (moduleId) query.moduleId = moduleId;

    if (contentSectionId) {
      query.$or = [
        { _id: contentSectionId },  // Match by _id
        { parentContent: contentSectionId }  // Match by parentContent
      ];
    }
    
    // Fetch content sections based on the query
    const sections = await ContentSection.find(query);

    let orphanEntries = [];
    let videoCount = 0;
    let codeCount = 0;
    const uniquePageIds = new Set(); // Use a Set to ensure uniqueness


    // Iterate through each section and each item
    for (let section of sections) {
      uniquePageIds.add(section.pageId.toString());  // Add pageId to Set

      for (let item of section.items) {
        const { type, _id: itemId, data } = item;

        if (type === "image") {
          // For images, collect orphan resources
          data.publicId&&orphanEntries.push({ publicId: data.publicId, type: "image", category: "pagePhoto" });
        }

        if (type === "mcq") {
          // For MCQs, orphan the images used in questions and options
          const publicIds = [];
          if (data?.ques?.publicId) publicIds.push(data.ques.publicId);
          if (data?.options) {
            data.options.forEach(opt => opt?.publicId && publicIds.push(opt.publicId));
          }

          // Collect orphan resources for MCQs
          publicIds.forEach(publicId => orphanEntries.push({ publicId, type: "image", category: "pagePhoto" }));
        }

        if (type === "code") {
          // For code, update the course's code count based on the length of the code
          const deletedItem = data;
          const decrementValue = deletedItem?.length || 0;
          codeCount += decrementValue;
        }

        if (type === "video") {
          // For videos, orphan the video and update video count
          const { publicId } = data;
          publicId&&orphanEntries.push({ publicId, type: "video", category: "pageVideo" });
          publicId&&videoCount++;
        }
      }
    }

    // Perform the orphan entries insertion, deletion of content sections, and course count update in parallel
    const [course]=await Promise.all([
      Course.findOneAndUpdate(
        { _id: courseId },
        { $inc: { 
          videoCount: -videoCount, 
          codeCount: -codeCount, 
          ...(isPageRemoved && { pageCount: -uniquePageIds.size ,}) // Decrease pageCount if pageRemoved is true
        } },
        { new: true }
      ).lean().select('videoCount codeCount pageCount'),
      orphanEntries.length ? OrphanResource.insertMany(orphanEntries, { ordered: false }) : Promise.resolve(),
      ContentSection.deleteMany(query),
    ]);

    return { success: true, message: "Content section items removed successfully.",course };

  } catch (error) {
    console.error("Error in removeContentSection:", error);
    return { success: false, message: error.message };
  }
};


module.exports = removeContentSection;