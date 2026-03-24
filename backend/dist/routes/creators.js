"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const ormconfig_1 = require("../ormconfig");
const Creator_1 = require("../entities/Creator");
const Favourite_1 = require("../entities/Favourite");
const PlatformAccount_1 = require("../entities/PlatformAccount");
const router = (0, express_1.Router)();
const creatorRepo = ormconfig_1.AppDataSource.getRepository(Creator_1.Creator);
const accountRepo = ormconfig_1.AppDataSource.getRepository(PlatformAccount_1.PlatformAccount);
const favouriteRepo = ormconfig_1.AppDataSource.getRepository(Favourite_1.Favourite);
router.post("/favourite", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const { name, platform, channel } = req.body;
    const userId = req.user.id;
    if (!name || !platform || !channel) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    // 1️⃣ Find or create creator
    let creator = await creatorRepo.findOne({
        where: { name },
        relations: { platformAccounts: true },
    });
    if (!creator) {
        creator = creatorRepo.create({ name });
        creator.platformAccounts = [];
        await creatorRepo.save(creator);
    }
    // 2️⃣ Find or create platform account
    let account = creator.platformAccounts?.find((acc) => acc.platform === platform && acc.channel === channel);
    if (!account) {
        account = accountRepo.create({
            platform,
            channel,
            creator,
        });
        await accountRepo.save(account);
        creator.platformAccounts.push(account);
    }
    // 3️⃣ Check if favourite already exists for this user & creator
    const existingFav = await favouriteRepo.findOne({
        where: {
            user: { id: userId },
            creator: { id: creator.id },
        },
    });
    if (existingFav) {
        return res.json({
            message: "Already favourited",
            creator,
        });
    }
    // 4️⃣ Create favourite
    const fav = favouriteRepo.create({
        user: { id: userId },
        creator,
    });
    await favouriteRepo.save(fav);
    res.json({
        message: "Creator favourited",
        creator,
    });
}));
router.get("/favourites", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    const userId = req.user.id;
    const favourites = await favouriteRepo.find({
        where: { user: { id: userId } },
        relations: {
            creator: {
                platformAccounts: true,
            },
        },
    });
    res.json(favourites);
}));
exports.default = router;
