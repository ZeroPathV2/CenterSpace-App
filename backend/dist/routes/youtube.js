"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
const { YOUTUBE_API_KEY } = process.env;
if (!YOUTUBE_API_KEY)
    throw new Error("Missing YOUTUBE_API_KEY");
router.get("/search", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const channel = req.query.channel?.trim();
    if (!channel)
        return res.status(400).json({ error: "Missing channel" });
    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channel)}&key=${YOUTUBE_API_KEY}`);
    if (!searchRes.ok) {
        const text = await searchRes.text();
        console.error("YouTube API Failed.", text);
        return res.status(searchRes.status).json({ error: "YouTube API error", details: text });
    }
    const searchData = await searchRes.json();
    if (!searchData.items || searchData.items.length === 0)
        return res.status(404).json({ error: "Channel not found" });
    const channelId = searchData.items[0].snippet.channelId;
    const channelRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`);
    if (!channelRes.ok) {
        const text = await channelRes.text();
        console.error("YouTube API Failed.");
        return res.status(channelRes.status).json({ error: "YouTube API error", details: text });
    }
    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0)
        return res.status(404).json({ error: "Channel not found" });
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    return res.json({
        videos: [
            {
                platform: "youtube",
                channel: channel,
                playlistItemId: uploadsPlaylistId,
                title: `${channel} uploads`,
                embedUrl: `https://www.youtube.com/embed/videoseries?list=${uploadsPlaylistId}&index=0`,
            }
        ]
    });
}));
router.get("/live", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const uploadsPlaylistId = req.query.playlistId;
    if (!uploadsPlaylistId)
        return res.status(400).json({ error: "Missing playlistId" });
    const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&key=${YOUTUBE_API_KEY}`);
    const playlistData = await playlistRes.json();
    const videoId = playlistData.items?.[0]?.snippet?.resourceId?.videoId;
    if (!videoId) {
        return res.json({ isLive: false });
    }
    const videoRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`);
    const videoData = await videoRes.json();
    const video = videoData.items?.[0];
    const isLive = video?.snippet?.liveBroadcastContent === "live";
    const embedUrl = isLive
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1`
        : null;
    res.json({ isLive, embedUrl });
}));
exports.default = router;
