const cloudinary = require("../config/cloudinary");
const OrphanResource = require("../models/OrphanResource");
const IMAGE_EXPIRY_TIME = 5 * 60 * 60;
const VIDEO_EXPIRY_TIME = 5 * 60 * 60; // 5 hours

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
            publicId:cloudUpload.public_id,
            type: "image",
            category: "profile" 
        });
        // await 
        res.status(201).json({ success: true, publicId: cloudUpload.public_id ,url:cloudUpload.secure_url });
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
        res.status(201).json({ success: true, publicId: cloudUpload.public_id ,url:cloudUpload.secure_url});
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
                { quality: "auto:best" },             // Best possible clarity for text
                { fetch_format: "auto" },                    // Auto-select best format (WebP, JPEG)
                { effect: "sharpen:50" },             // Light sharpening to make text pop

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
        
        res.status(201).json({ success: true, 
            publicId: cloudUpload.public_id ,
            url:cloudUpload.secure_url,
            width:cloudUpload.width,
            height:cloudUpload.height,
        });
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
            type: "authenticated",
            format: "mp4",
            transformation: [
                { quality: "auto:good" },
                { fetch_format: "mp4" },
                { width: 960, height: 540, crop: "limit" },
                { video_codec: "h264" },
                { bit_rate: "250k" },
                { fps: "10" },
                { audio_codec: "aac" },
                { audio_bit_rate: "24k" }  // 💡 Lowered for speech-only use
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
        const publicId=cloudUpload.public_id;
        // Store in OrphanResource
        await OrphanResource.create({
            publicId,
            type: "video",
            category: "pageVideo"
        });
        const url = cloudinary.utils.private_download_url(publicId, "mp4", {
            resource_type: "video",
            type: "authenticated", // matches the uploaded asset type
            expires_at: Math.floor(Date.now() / 1000) + VIDEO_EXPIRY_TIME // expires in 10 seconds
        });
        res.status(201).json({ success: true, publicId,url});
    } catch (error) {
        console.log("error is from uploadController",error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


module.exports = { uploadProfile,uploadThumbnail,pagePhoto,pageVideo};
