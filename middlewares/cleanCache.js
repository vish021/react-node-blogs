const { clearHash } = require('../services/cache');

module.exports = async (req, res, next) => {
    await next();//route handler then come back here

    clearHash(req.user.id);
};