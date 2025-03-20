const crypto = require('crypto');
const Profile = require('../../models/Profile'); // Adjusted path

const extractUsername = (url) => {
    const parts = url.split('/').filter(Boolean); // Remove empty parts
    return parts[parts.length - 1]; // Take the last part
};

const setCodingProfile = async (req, res) => {
    try {
        const { platform, url } = req.body;

        if (!platform || !url) {
            return res.status(400).json({ message: "Platform and URL are required." });
        }

        const username = extractUsername(url);
        if (!username) {
            return res.status(400).json({ message: "Invalid URL format." });
        }

        const hashCode = crypto.randomBytes(4).toString('hex'); // Generates 8-character hash

        const updateResult = await Profile.updateOne(
            { user: req.user._id }, 
            { 
                $set: { 
                    [`codingProfiles.${platform}.url`]: url, 
                    [`codingProfiles.${platform}.username`]: username,
                    [`codingProfiles.${platform}.hashCode`]: hashCode 
                } 
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ message: "Profile not found or nothing changed." });
        }

        res.status(200).json({ message: "Coding profile updated successfully.", username, hashCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = setCodingProfile;
