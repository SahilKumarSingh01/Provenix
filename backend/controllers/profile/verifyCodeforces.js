const Profile = require('../../models/Profile'); // Adjust path as needed
const fetch = require('node-fetch');

async function verifyCodeforces(req, res) {
    try {
        // Step 1: Fetch user profile from the database
        const profile = await Profile.findOne({ user: req.user.id });

        if (!profile || !profile.codingProfiles.codeforces?.username) {
            return res.status(400).json({ message: "Codeforces profile not linked." });
        }

        // Step 2: Get Codeforces username directly
        const username = profile.codingProfiles.codeforces.username;

        // Step 3: Fetch Codeforces user information
        const apiUrl = `https://codeforces.com/api/user.info?handles=${username}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Step 4: Check if user exists in Codeforces API response
        if (data.status !== "OK" || !data.result || data.result.length === 0) {
            return res.status(404).json({ message: "Codeforces user not found." });
        }

        // Step 5: Verify if `firstName` matches `hashCode`
        const firstName = data.result[0].firstName || "";
        if (firstName.trim() === profile.codingProfiles.codeforces.hashCode.trim()) {
            profile.codingProfiles.codeforces.isVerified = true;
            await profile.save();
            return res.json({ message: "Codeforces profile verified successfully!" });
        } else {
            return res.status(400).json({ 
                message: "Verification failed. 'firstName' does not match the stored hashCode.",
                hashCode: profile.codingProfiles.codeforces.hashCode
            });
        }

    } catch (error) {
        console.error("Error verifying Codeforces:", error);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = verifyCodeforces;
