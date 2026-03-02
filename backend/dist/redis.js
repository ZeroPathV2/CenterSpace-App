"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL
});
exports.redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});
async function connectRedis() {
    await exports.redisClient.connect();
    console.log("Redis connected");
}
