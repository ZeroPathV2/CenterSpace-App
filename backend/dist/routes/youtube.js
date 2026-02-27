"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const router = (0, express_1.Router)();
const { YOUTUBE_API_KEY } = process.env;
if (!YOUTUBE_API_KEY)
    throw new Error("Missing YOUTUBE_API_KEY");
router.get("/search", requireAuth_1.requireAuth, async (req, res) => {
    var _a;
    try {
        const channel = (_a = req.query.channel) === null || _a === void 0 ? void 0 : _a.trim();
        if (!channel)
            return res.status(400).json({ error: "Missing channel" });
        // Step 1: Search channel
        const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channel)}&key=${YOUTUBE_API_KEY}`);
        const searchData = await searchRes.json();
        if (!searchData.items || searchData.items.length === 0)
            return res.status(404).json({ error: "Channel not found" });
        const channelId = searchData.items[0].snippet.channelId;
        // Step 2: Get uploads playlist
        const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelRes.json();
        if (!channelData.items || channelData.items.length === 0)
            return res.status(404).json({ error: "Channel not found" });
        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        res.json({
            videos: [
                {
                    videoId: uploadsPlaylistId, // use playlist id
                    title: `${channel} uploads`,
                    embedUrl: `https://www.youtube.com/embed?list=${uploadsPlaylistId}&autoplay=1&index=0`,
                },
            ],
        });
    }
    catch (error) {
        console.error("YouTube fetch failed:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;
