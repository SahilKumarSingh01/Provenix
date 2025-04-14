const Profile = require('../../models/Profile'); // Adjust path as needed
// const {fetch} = require('node-fetch');

async function verifyLeetcode(req, res) {
    try {
        // Step 1: Fetch user profile from the database
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile || !profile.codingProfiles.leetcode?.username) {
            return res.status(400).json({ message: "LeetCode profile not linked." });
        }
        // Step 2: Get LeetCode username directly
        const username = profile.codingProfiles.leetcode.username;

        // Step 3: Construct GraphQL query in the URL
        const graphqlQuery = encodeURIComponent(`
            {
                matchedUser(username: "${username}") {
                    profile {
                        aboutMe
                    }
                }
            }
        `);

        const apiUrl = `https://leetcode.com/graphql?query=${graphqlQuery}`;

        // Step 4: Fetch LeetCode data using GET request
        const response = await fetch(apiUrl, { method: "GET" });
        const data = await response.json();

        if (!data.data || !data.data.matchedUser) {
            return res.status(404).json({ message: "LeetCode user not found." });
        }

        // Step 5: Verify if `aboutMe` matches `hashCode`
        const aboutMe = data.data.matchedUser.profile?.aboutMe || "";
        if (aboutMe.trim() === profile.codingProfiles.leetcode.hashCode.trim()) {
            profile.codingProfiles.leetcode.isVerified = true;
            await profile.save();
            return res.json({ message: "LeetCode profile verified successfully!" });
        } else {
            return res.status(400).json({ message: "Verification failed. 'Summary' in basic info does not match the stored hashCode." });
        }

    } catch (error) {
        // console.error("Error verifying LeetCode:", error);
        res.status(500).json({ message:error.message });
    }
}

module.exports = verifyLeetcode;
