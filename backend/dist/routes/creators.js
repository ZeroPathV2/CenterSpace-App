"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireUser_1 = require("../middleware/requireUser");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ormconfig_1 = require("../ormconfig");
const Creator_1 = require("../entities/Creator");
const router = (0, express_1.Router)();
const creatorRepo = ormconfig_1.AppDataSource.getRepository(Creator_1.Creator);
router.post("/", requireUser_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const { platform, playlistItemId, name } = req.body;
    const creator = creatorRepo.create({
        platform,
        playlistItemId,
        name
    });
    await creatorRepo.save(creator);
    res.json(creator);
}));
router.get("/", requireUser_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const creators = await creatorRepo.find();
    res.json(creators);
}));
exports.default = router;
