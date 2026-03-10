"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = require("express");
const ormconfig_1 = require("../ormconfig");
const OAuthToken_1 = require("../entities/OAuthToken");
const OAuthProvider_1 = require("../entities/OAuthProvider");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../redis");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// const {TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI} = process.env
if (!process.env.FRONTEND_HOST || !process.env.FRONTEND_PORT) {
    throw new Error("Invalid host environment.");
}
// console.log("Parent:",`parent=${process.env.FRONTEND_HOST!}&parent=${process.env.FRONTEND_HOST!}:${process.env.FRONTEND_PORT!}`);
const parentParam = `parent=localhost`; // &parent=${process.env.FRONTEND_HOST!}:${process.env.FRONTEND_PORT!}
const tokenRepo = ormconfig_1.AppDataSource.getRepository(OAuthToken_1.OAuthToken);
router.get("/connect", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const state = crypto_1.default.randomUUID();
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ error: "Not logged in" });
    }
    await redis_1.redisClient.set(`oauth:${state}`, String(userId), {
        EX: 300
    });
    const url = `https://id.twitch.tv/oauth2/authorize` +
        `?client_id=${process.env.TWITCH_CLIENT_ID}` +
        `&redirect_uri=${process.env.TWITCH_REDIRECT_URI}` +
        `&response_type=code` +
        `&scope=user:read:email` +
        `&state=${state}`;
    return res.redirect(url);
}));
router.get("/callback", (0, asyncHandler_1.default)(async (req, res) => {
    const code = req.query.code;
    const state = req.query.state;
    if (!code || !state) {
        return res.status(400).json({ error: "Invalid request" });
    }
    const userId = await redis_1.redisClient.get(`oauth:${state}`);
    if (!userId) {
        return res.status(400).json({ error: "Invalid state" });
    }
    await redis_1.redisClient.del(`oauth:${state}`);
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.TWITCH_CLIENT_ID,
            client_secret: process.env.TWITCH_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.TWITCH_REDIRECT_URI,
        }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token)
        return res.status(400).json(tokenData);
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const existing = await tokenRepo.findOne({
        where: { user: { id: Number(userId) }, provider: OAuthProvider_1.OAuthProvider.TWITCH }
    });
    if (existing) {
        existing.accessToken = tokenData.access_token;
        existing.refreshToken = tokenData.refresh_token;
        existing.expiresAt = expiresAt;
        await tokenRepo.save(existing);
    }
    else {
        await tokenRepo.save({
            user: { id: Number(userId) },
            provider: OAuthProvider_1.OAuthProvider.TWITCH,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt,
        });
    }
    res.redirect(`http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}`);
}));
router.get("/search", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user?.id;
    const channel = req.query.channel?.trim();
    if (!channel) {
        return res.status(400).json({ error: "Missing channel" });
    }
    let tokenRecord = await tokenRepo.findOne({
        where: {
            user: { id: userId },
            provider: OAuthProvider_1.OAuthProvider.TWITCH,
        },
    });
    if (!tokenRecord) {
        return res.status(401).json({ error: "Not authenticated with Twitch" });
    }
    // REFRESH EXPIRED TOKEN
    if (tokenRecord.expiresAt && tokenRecord.expiresAt <= new Date()) {
        const refreshRes = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: tokenRecord.refreshToken,
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
            }),
        });
        const refreshData = await refreshRes.json();
        if (!refreshData.access_token) {
            throw new Error("Failed to refresh token");
        }
        tokenRecord.accessToken = refreshData.access_token;
        tokenRecord.refreshToken =
            refreshData.refresh_token ?? tokenRecord.refreshToken;
        tokenRecord.expiresAt = new Date(Date.now() + refreshData.expires_in * 1000);
        await tokenRepo.save(tokenRecord);
    }
    const token = tokenRecord.accessToken;
    // GET TWITCH USER
    const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Client-Id": process.env.TWITCH_CLIENT_ID,
        },
    });
    const userData = await userRes.json();
    const user = userData.data?.[0];
    if (!user) {
        return res.status(404).json({ error: "Channel not found" });
    }
    // CHECK IF LIVE
    const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${user.id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Client-Id": process.env.TWITCH_CLIENT_ID,
        },
    });
    const streamData = await streamRes.json();
    const stream = streamData.data?.[0];
    if (stream) {
        return res.json({
            videos: [
                {
                    platform: "twitch",
                    playlistItemId: stream.id,
                    title: stream.title,
                    embedUrl: `https://player.twitch.tv/?channel=${channel}&${parentParam}`,
                },
            ],
        });
    }
    // GET LATEST VOD
    const vodRes = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&first=1`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Client-Id": process.env.TWITCH_CLIENT_ID,
        },
    });
    const vodData = await vodRes.json();
    const vod = vodData.data?.[0];
    if (!vod) {
        return res.status(404).json({ error: "No videos found" });
    }
    return res.json({
        videos: [
            {
                platform: "twitch",
                playlistItemId: vod.id,
                title: vod.title,
                embedUrl: `https://player.twitch.tv/?video=${vod.id}&${parentParam}`,
            },
        ],
    });
}));
exports.default = router;
