const cloudinary = require("../config/cloudinary");
const OrphanResource = require("../models/OrphanResource");

const uploadProfile = async (req, res) => {
    try {
        if (!req.file) {  
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const uploadOptions = {
            folder: "profile",
            type: "authenticated",  // Private upload
            format: "webp",         // Best compression
            transformation: [
                { width: 100, height: 100, crop: "fill" },  // Exact dimensions, crop to fit
                { quality: "auto:low" },                   // Lower quality for better compression
                { fetch_format: "auto" }                   // Use best format (WebP, JPEG)
            ]
        };

        // Upload to Cloudinary
        const cloudUpload = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });

            uploadStream.end(req.file.buffer);
        });

        const { public_id: publicId, format } = cloudUpload;
        console.log(cloudUpload);

        res.status(201).json({ success: true, publicId });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { uploadProfile };
