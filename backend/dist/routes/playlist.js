"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const ormconfig_1 = require("../ormconfig");
const PlaylistVideo_1 = require("../entities/PlaylistVideo");
const router = (0, express_1.Router)();
router.post("/", requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const { videoId, title, embedUrl } = req.body;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistVideo_1.PlaylistVideo);
    // prevent duplicates
    const exists = await repo.findOne({
        where: { videoId, user: { id: userId } },
    });
    if (exists)
        return res.json(exists);
    const video = repo.create({
        videoId,
        title,
        embedUrl,
        user: { id: userId },
    });
    await repo.save(video);
    res.json(video);
});
router.get("/", requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistVideo_1.PlaylistVideo);
    const videos = await repo.find({
        where: { user: { id: userId } },
    });
    res.json(videos);
});
// DELETE SINGLE VIA ID /playlist/:id
router.delete("/:id", requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const videoId = Number(req.params.id);
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistVideo_1.PlaylistVideo);
    // Only delete if the video belongs to this user
    const result = await repo.delete({ id: videoId, user: { id: userId } });
    if (result.affected === 0)
        return res.status(404).json({ error: "Video not found" });
    res.json({ message: "Video removed" });
});
// CLEAR ALL
router.delete("/", requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistVideo_1.PlaylistVideo);
    await repo.delete({ user: { id: userId } });
    res.json({ message: "Playlist cleared" });
});
exports.default = router;
