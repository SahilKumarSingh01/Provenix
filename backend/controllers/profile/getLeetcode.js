const {LeetCode} = require('leetcode-query');

const getLeetcode = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const leetcode =new LeetCode();
    const userData = await leetcode.user(username);
    if (!userData || !userData.matchedUser) {
      return res.status(404).json({ error: 'User not found on Leetcode' });
    }

    const { matchedUser, allQuestionsCount, recentSubmissionList } = userData;
    const { profile, badges, upcomingBadges, activeBadge, submitStats } = matchedUser;
    console.log( userData);
    res.status(200).json({
      profile: {
        username: matchedUser.username,
        realName: profile.realName,
        country: profile.countryName,
        reputation: profile.reputation,
        ranking: profile.ranking,
        starRating: profile.starRating,
        aboutMe: profile.aboutMe,
        avatar: profile.userAvatar
      },
      questionsByDifficulty: submitStats.acSubmissionNum,
      totalQuestions: allQuestionsCount,
      recentSubmissions: recentSubmissionList,
      badges,
      upcomingBadges,
      activeBadge 
    });
 
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch LeetCode profile' });
  }
};


module.exports = getLeetcode;
