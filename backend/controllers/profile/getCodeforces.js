// Controller to fetch Codeforces profile
const getCodeforces = async (req, res) => {
    const { username } = req.query;
   
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
  
    const apiUrl = `https://codeforces.com/api/user.info?handles=${username}`;
  
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.status !== 'OK') {
        return res.status(404).json({ error: 'User not found on Codeforces' });
      }
      
      res.status(200).json(data.result[0]);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch data from Codeforces' });
    }
  };
  
  module.exports = getCodeforces;
  
