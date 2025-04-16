// Controller to fetch GitHub profile
const getGithub = async (req, res) => {
    const { username } = req.query;
  
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
  
    const apiUrl = `https://api.github.com/users/${username}`;
  
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
      // console.error(err);
      res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
  };
  
  module.exports = getGithub;
  