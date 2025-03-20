const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    codingProfiles: {
        leetcode: {
            username: { type: String, default: "" }, // Extracted username
            url: { type: String, default: "" }, // Profile URL
            isVerified: { type: Boolean, default: false },
            hashCode: { type: String, default: "" } // Used for verification
        },
        codeforces: {
            username: { type: String, default: "" }, // Extracted username
            url: { type: String, default: "" }, // Profile URL
            isVerified: { type: Boolean, default: false },
            hashCode: { type: String, default: "" }
        },
        github: {
            username: { type: String, default: "" }, // Extracted username
            url: { type: String, default: "" }, // Profile URL
            isVerified: { type: Boolean, default: false },
            hashCode: { type: String, default: "" }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
