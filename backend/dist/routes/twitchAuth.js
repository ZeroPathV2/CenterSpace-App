"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
const ormconfig_1 = require("../ormconfig");
const OAuthToken_1 = require("../entities/OAuthToken");
const OAuthProvider_1 = require("../entities/OAuthProvider");
// /twitch/connect
const router = (0, express_1.Router)();
router.get("/login", requireAuth_1.requireAuth, (req, res) => {
    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?` +
        `client_id=${process.env.TWITCH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.TWITCH_REDIRECT_URI)}` +
        `&response_type=code` +
        `&scope=user:read:email`;
    res.json({ url: twitchAuthUrl });
});
router.get("/callback", async (req, res) => {
    const { code } = req.query;
    const userId = req.session.userId;
    if (!code || !userId)
        return res.status(400).send("Invalid request");
    const tokenRes = await fetch(`https://id.twitch.tv/oauth2/token?` +
        `client_id=${process.env.TWITCH_CLIENT_ID}` +
        `&client_secret=${process.env.TWITCH_CLIENT_SECRET}` +
        `&code=${code}` +
        `&grant_type=authorization_code` +
        `&redirect_uri=${process.env.TWITCH_REDIRECT_URI}`, {
        method: "POST",
    });
    const tokenData = await tokenRes.json();
    // Save token to DB
    const tokenRepo = ormconfig_1.AppDataSource.getRepository(OAuthToken_1.OAuthToken);
    await tokenRepo.save({
        user: { id: userId },
        provider: OAuthProvider_1.OAuthProvider.TWITCH,
        accessToken: tokenData.access_token,
    });
    res.redirect("http://localhost:3000"); // send user back to frontend
});
