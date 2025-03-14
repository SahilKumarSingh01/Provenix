const cloudinary = require("../config/cloudinary");
const OrphanResource = require("../models/OrphanResource");

const uploadProfile = async (req, res) => {
    try {
        if (!req.file) {  
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({ success: false, message: "Invalid file type. Only images are allowed." });
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
        await OrphanResource.create({
            publicId,
            type: "image",
            category: "profile" 
        });
        // await 
        res.status(201).json({ success: true, publicId });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const uploadThumbnail = async (req, res) => {
    try {
        if (!req.file) {  
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({ success: false, message: "Invalid file type. Only images are allowed." });
        }

        const uploadOptions = {
            folder: "thumbnail",  
            type: "authenticated",  // Private upload
            format: "webp",         // Best compression
            transformation: [
                { width: 320, height: 240, crop: "fill" },  // **New Resolution (320x240)**
                { quality: "auto:good" },                  // **Better quality, still optimized**
                { fetch_format: "auto" }                   // Auto-select best format (WebP, JPEG)
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

        await OrphanResource.create({
            publicId: cloudUpload.public_id,
            type: "image",
            category: "thumbnail" 
        });

        res.status(201).json({ success: true, publicId: cloudUpload.public_id });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const pagePhoto = async (req, res) => {
    try {
        if (!req.file) {  
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        if (!req.file.mimetype.startsWith("image/")) {
            return res.status(400).json({ success: false, message: "Invalid file type. Only images are allowed." });
        }

        const uploadOptions = {
            folder: "pagePhoto",  
            type: "authenticated",  // Private upload
            format: "webp",         // Best compression
            transformation: [
                { width: 600, height: 600, crop: "limit" },  // **Ensures full image within 600x600**
                { quality: "auto:good" },                   // **Higher quality, still optimized**
                { fetch_format: "auto" }                    // Auto-select best format (WebP, JPEG)
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

        await OrphanResource.create({
            publicId: cloudUpload.public_id,
            type: "image",
            category: "pagePhoto"   // **Updated category**
        });

        res.status(201).json({ success: true, publicId: cloudUpload.public_id });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
const pageVideo = async (req, res) => {
    try {
        if (!req.file) {  
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        if (!req.file.mimetype.startsWith("video/")) {
            return res.status(400).json({ success: false, message: "Invalid file type. Only videos are allowed." });
        }

        const uploadOptions = {
            folder: "pageVideo",  
            resource_type: "video",
            format: "mp4",           // **MP4 for universal compatibility**
            transformation: [
                { quality: "auto:good" },  // **Balances quality & compression**
                { fetch_format: "mp4" },   // **Ensures MP4 format**
                { width: 960, height: 540, crop: "limit" }, // **540p resolution**
                { video_codec: "h264" },   // **H.264 for efficient compression**
                { bit_rate: "400k" },      // **Slightly higher than WebM for same quality**
                { fps: "24" },             // **Smooth playback, reduces size**
                { audio_codec: "aac" },    // **Good audio quality & compression**
                { audio_bit_rate: "80k" }  // **Reduces size while keeping clear speech**
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

        // Store in OrphanResource
        await OrphanResource.create({
            publicId: cloudUpload.public_id,
            type: "video",
            category: "pageVideo"
        });
        console.log(cloudUpload);
        res.status(201).json({ success: true, publicId: cloudUpload.public_id });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { uploadProfile,uploadThumbnail,pagePhoto,pageVideo};
