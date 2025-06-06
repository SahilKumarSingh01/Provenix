const getAll = require('./profile/getAll');
const getProfile = require('./profile/getProfile');
const getMyProfile = require('./profile/getMyProfile');

const setCodingProfile=require('./profile/setCodingProfile');

const verifyLeetcode = require('./profile/verifyLeetcode');
const verifyCodeforces = require('./profile/verifyCodeforces');
const verifyGithub = require('./profile/verifyGithub');

const getLeetcode = require('./profile/getLeetcode');
const getCodeforces = require('./profile/getCodeforces');
const getGithub = require('./profile/getGithub');

const updateMyProfile = require('./profile/updateMyProfile');
const recoverAccount=require('./profile/recoverAccount');
const getNotifications=require('./profile/getNotifications')
const markNotification=require('./profile/markNotifiaction')
const {generateToken,verifyAndDelete}=require('./profile/deleteAccount')

module.exports = {
    getAll,
    getProfile,
    getMyProfile,
    setCodingProfile,
    verifyLeetcode,
    verifyCodeforces,
    verifyGithub,
    updateMyProfile,
    generateToken,
    verifyAndDelete,
    recoverAccount,
    getLeetcode,
    getCodeforces,
    getGithub,
    getNotifications,
    markNotification,
};
