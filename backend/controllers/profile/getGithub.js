// Controller to fetch GitHub profile
require('dotenv').config();

const getGithub = async (req, res) => {
    const { username } = req.query;
  
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    const apiUrl = `https://api.github.com/users/${username}?client_id=${clientId}&client_secret=${clientSecret}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (!data) {
        return res.status(404).json({ error: 'User not found on GitHub' });
      }
  
      res.status(200).json({
        login: data.login,
        name: data.name,
        bio: data.bio,
        public_repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        avatar_url: data.avatar_url,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
  };
  
  module.exports = getGithub;
  