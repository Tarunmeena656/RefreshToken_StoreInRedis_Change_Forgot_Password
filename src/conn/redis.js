const redis = require('redis')

const RedisClient = redis.createClient({ url: 'redis://127.0.0.1:6379' });

RedisClient.connect();

RedisClient.on('connect', () => {
    console.log("Redis connected successfully");
});

RedisClient.on('error', () => {
    console.log("Redis connected error");
});


module.exports = RedisClient