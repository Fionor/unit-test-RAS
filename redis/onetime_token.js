const bcrypt = require('bcryptjs');
const Redis = require('ioredis');
const config = require('../config');
const redis = new Redis({...config.redis});

module.exports.set_onetime_token = async () => {
    const token = bcrypt.genSaltSync(5);
    await redis.set(`onetime_token:${token}`, true, 'EX', 10);
    return token;
}

module.exports.get_onetime_token = async (token) => {
    const result = await redis.get(`onetime_token:${token}`);
    if( result ) await redis.del(`onetime_token:${token}`);
    return result;
}

process.once('SIGUSR2', function() {
    redis.disconnect();
    process.kill(process.pid, 'SIGUSR2');
});
// For app termination
process.on('SIGINT', function() {
    redis.disconnect();
    process.exit(0);

});
// For Heroku app termination
process.on('SIGTERM', function() {
    redis.disconnect();
    process.exit(0);
});