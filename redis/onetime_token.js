const bcrypt = require('bcryptjs');
const Redis = require('ioredis');
const config = require('../config');

module.exports.set_onetime_token = async () => {
    const token = bcrypt.genSaltSync(20);
    const redis = new Redis({...config.redis});
    await redis.set(`onetime_token:${token}`, true, 'EX', 10);
    redis.disconnect();
    return token;
}

module.exports.get_onetime_token = async (token) => {
    const redis = new Redis({...config.redis});
    const result = await redis.get(`onetime_token:${token}`);
    if( result ) await redis.del(`onetime_token:${token}`);
    redis.disconnect();
    return result;
}