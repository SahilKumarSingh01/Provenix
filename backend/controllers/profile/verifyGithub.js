const fetch = require('node-fetch');
const Profile = require('../../models/Profile');
const crypto = require('crypto');

const verifyGithub = async (req, res) => {
    try {
        const userId = req.user._id; // Extract user ID from the authenticated request

        if (!userId) {
            return res.status(400).json({ message: "Unauthorized request." });
        }

        // Fetch user's profile from the database
        const profile = await Profile.findOne({ user: userId });

        if (!profile || !profile.codingProfiles.github?.username) {
            return res.status(404).json({ message: "GitHub profile not linked." });
        }

        // Get GitHub username directly
        const username = profile.codingProfiles.github.username;

        // Fetch GitHub profile data
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            return res.status(400).json({ message: "GitHub profile not found." });
        }
        const githubData = await response.json();

        if (githubData.bio === profile.codingProfiles.github.hashCode) {
            // If bio matches hashCode, mark GitHub as verified
            await Profile.updateOne({ user: userId }, { $set: { "codingProfiles.github.isVerified": true } });
            return res.status(200).json({ message: "GitHub profile verified successfully!" });
        } else {
            // Generate a new hashCode and send instructions
            const hashCode = crypto.randomBytes(4).toString('hex');
            await Profile.updateOne({ user: userId }, { $set: { "codingProfiles.github.hashCode": hashCode } });

            return res.status(200).json({
                message: "Verification failed. Please update your GitHub bio with the provided code and retry.",
                hashCode
            });
        }
    } catch (error) {
        console.error("Error verifying GitHub:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = verifyGithub;
