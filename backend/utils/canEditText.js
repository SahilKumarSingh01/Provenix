function levenshteinDistance(s1, s2) {
    const len1 = s1.length, len2 = s2.length;
    let dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i][j - 1], dp[i - 1][j]) + 1;
            }
        }
    }

    return dp[len1][len2];
}

function canEditText(oldText, newText) {
    let distance = levenshteinDistance(oldText, newText);
    let percentageChange = (distance / oldText.length) * 100;
    return percentageChange <= 30;  // Allow edit if change is ≤ 30%
}

module.exports=canEditText;