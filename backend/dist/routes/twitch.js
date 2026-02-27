"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ormconfig_1 = require("../ormconfig");
const OAuthToken_1 = require("../entities/OAuthToken");
const OAuthProvider_1 = require("../entities/OAuthProvider");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
router.get("/search", requireAuth_1.requireAuth, async (req, res) => {
    var _a, _b, _c, _d, _e;
    try {
        const userId = (_a = req.session) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ error: "Not logged in" });
        const channel = (_b = req.query.channel) === null || _b === void 0 ? void 0 : _b.trim();
        if (!channel)
            return res.status(400).json({ error: "Missing channel" });
        // Get the user’s Twitch token
        const tokenRepo = ormconfig_1.AppDataSource.getRepository(OAuthToken_1.OAuthToken);
        const tokenRecord = await tokenRepo.findOne({
            where: { user: { id: userId }, provider: OAuthProvider_1.OAuthProvider.TWITCH },
        });
        if (!tokenRecord)
            return res.status(401).json({ error: "Not authenticated with Twitch" });
        const token = tokenRecord.accessToken;
        const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID,
            },
        });
        const userData = await userRes.json();
        const user = (_c = userData.data) === null || _c === void 0 ? void 0 : _c[0];
        if (!user)
            return res.status(404).json({ error: "Channel not found" });
        // Check if live
        const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${user.id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID,
            },
        });
        const streamData = await streamRes.json();
        const stream = (_d = streamData.data) === null || _d === void 0 ? void 0 : _d[0];
        if (stream) {
            return res.json({
                platform: "twitch",
                videos: [
                    {
                        videoId: stream.id,
                        title: stream.title,
                        embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=localhost`,
                    },
                ],
            });
        }
        // Latest VOD
        const vodRes = await fetch(`https://api.twitch.tv/helix/videos?user_id=${user.id}&first=1`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Client-Id": process.env.TWITCH_CLIENT_ID,
            },
        });
        const vodData = await vodRes.json();
        const vod = (_e = vodData.data) === null || _e === void 0 ? void 0 : _e[0];
        if (!vod)
            return res.status(404).json({ error: "No videos found" });
        return res.json({
            platform: "twitch",
            videos: [
                {
                    videoId: vod.id,
                    title: vod.title,
                    embedUrl: `https://player.twitch.tv/?video=${vod.id}&parent=localhost`,
                },
            ],
        });
    }
    catch (error) {
        console.error("Twitch search error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
