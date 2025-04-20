// const fetch = require('node-fetch');
const Profile = require('../../models/Profile');

const verifyGithub = async (req, res) => {
    try {
        const userId = req.user.id;

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
            return res.status(400).json({ 
                message: "Verification failed. 'bio' does not match the stored hashCode.",
                hashCode: profile.codingProfiles.codeforces.hashCode
            });
        }
    } catch (error) {
        console.error("Error verifying GitHub:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

module.exports = verifyGithub;
