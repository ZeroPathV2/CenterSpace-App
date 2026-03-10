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
const router = (0, express_1.Router)();
router.post("/", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const { platform, playlistItemId, title, embedUrl } = req.body;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    // prevent duplicates
    const exists = await repo.findOne({
        where: { playlistItemId, user: { id: userId } },
    });
    if (exists)
        return res.json(exists);
    const item = repo.create({
        platform,
        playlistItemId,
        title,
        embedUrl,
        user: { id: userId },
    });
    await repo.save(item);
    res.json(item);
}));
router.get("/", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    const item = await repo.find({
        // order: { position: "ASC" },
        where: { user: { id: userId } },
    });
    res.json(item);
}));
// CHANGE - what are "transactional updates"
router.put("/reorder", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const { items } = req.body;
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
    for (const item of items) {
        await repo.update({ id: item.id }, { position: item.position });
    }
    res.json({ success: true });
}));
// DELETE SINGLE VIA ID /playlist/:id
router.delete("/:id", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const itemId = Number(req.params.id);
    const repo = ormconfig_1.AppDataSource.getRepository(PlaylistItem_1.PlaylistItem);
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
    await repo.delete({ user: { id: userId } });
    res.json({ message: "Playlist cleared" });
}));
exports.default = router;
