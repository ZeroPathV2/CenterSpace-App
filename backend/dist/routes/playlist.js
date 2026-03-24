"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ormconfig_1 = require("../ormconfig");
const PlaylistItem_1 = require("../entities/PlaylistItem");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const OAuthProvider_1 = require("../entities/OAuthProvider");
const OAuthToken_1 = require("../entities/OAuthToken");
const router = (0, express_1.Router)();
router.post("/", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const { platform, channel, playlistItemId, embedUrl } = req.body;
    if (!playlistItemId || !embedUrl) {
        return res.status(400).json({ error: "Invalid video data" });
    }
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    if (!repo)
        throw new Error("Failed action.");
    // prevent duplicates
    const exists = await repo.findOne({
        where: { playlistItemId, user: { id: userId } },
    });
    if (exists)
        return res.json(exists);
    const item = repo.create({
        platform,
        channel,
        playlistItemId,
        embedUrl,
        user: { id: userId },
    });
    await repo.save(item);
    res.json(item);
}));
router.get("/", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    const tokenRepo = ormconfig_1.AppDataSource.getRepository(OAuthToken_1.OAuthToken);
    const items = await repo.find({ where: { user: { id: userId } }, });
    if (!tokenRepo)
        throw new Error("Failed action.");
    // Fetch user's Twitch token
    const tokenRecord = await tokenRepo.findOne({
        where: {
            user: { id: userId },
            provider: OAuthProvider_1.OAuthProvider.TWITCH
        },
    });
    if (!tokenRecord) {
        return res.status(401).json({ error: "Not authenticated with Twitch" });
    }
    // Add channel dynamically
    const itemsWithChannel = await Promise.all(items.map(async (item) => {
        try {
            const resVideo = await fetch(`https://api.twitch.tv/helix/videos?id=${item.playlistItemId}`, {
                headers: {
                    Authorization: `Bearer ${tokenRecord.accessToken}`,
                    "Client-Id": process.env.TWITCH_CLIENT_ID,
                },
            });
            const videoData = await resVideo.json();
            const video = videoData.data?.[0];
            const channelName = video?.user_name ?? item.channel ?? "unknown";
            const embedUrl = item.embedUrl || (video ? `https://player.twitch.tv/?video=${video.id}&parent=localhost&autoplay=false` : null);
            return { ...item, channel: channelName, embedUrl };
        }
        catch (err) {
            console.error("Failed to fetch channel for video:", item.playlistItemId, err);
            return { ...item, channel: item.channel ?? "unknown", embedUrl: item.embedUrl ?? null };
        }
    }));
    res.json(itemsWithChannel);
}));
// backend/routes/playlist.ts
router.put("/:id", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const itemId = Number(req.params.id);
    const { playlistItemId, embedUrl, channel } = req.body;
    if (!playlistItemId || !embedUrl) {
        return res.status(400).json({ error: "Invalid video data" });
    }
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    if (!repo)
        throw new Error("Failed action.");
    // Update only if belongs to this user
    const item = await repo.findOne({ where: { id: itemId, user: { id: userId } } });
    if (!item)
        return res.status(404).json({ error: "Playlist item not found" });
    item.playlistItemId = playlistItemId;
    item.embedUrl = embedUrl;
    item.channel = channel;
    await repo.save(item);
    res.json(item);
}));
// DELETE SINGLE VIA ID /playlist/:id
router.delete("/:id", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const itemId = Number(req.params.id);
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    if (!repo)
        throw new Error("Failed action.");
    // Only delete if the item belongs to this user
    const result = await repo.delete({ id: itemId, user: { id: userId } });
    if (result.affected === 0)
        return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item removed" });
}));
// CLEAR ALL
router.delete("/", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    if (!repo)
        throw new Error("Failed action.");
    await repo.delete({ user: { id: userId } });
    res.json({ message: "Playlist cleared" });
}));
exports.default = router;
