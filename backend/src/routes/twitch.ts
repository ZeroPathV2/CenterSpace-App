import dotenv from "dotenv";
dotenv.config();

import { Router } from "express";
import { AppDataSource } from "../ormconfig";
import { OAuthToken } from "../entities/OAuthToken";
import { OAuthProvider } from "../entities/OAuthProvider";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

// const {TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI} = process.env

router.get("/connect", requireAuth, (req, res) => {
  const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?` +
    `client_id=${process.env.TWITCH_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.TWITCH_REDIRECT_URI!)}` +
    `&response_type=code` +
    `&scope=user:read:email`;

  res.json({ url: twitchAuthUrl });
});

router.get("/callback", requireAuth, async (req, res) => {
  try {
    const { code } = req.query;
    const userId = req.session.userId;

    if (!code || !userId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        code: code as string,
        grant_type: "authorization_code",
        redirect_uri: process.env.TWITCH_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(400).json(tokenData);
    }

    const tokenRepo = AppDataSource.getRepository(OAuthToken);
    await tokenRepo.save({
      user: { id: userId },
      provider: OAuthProvider.TWITCH,
      accessToken: tokenData.access_token,
    });

    res.redirect("http://localhost:3000");
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search", requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) return res.status(401).json({ error: "Not logged in" });

    const channel = (req.query.channel as string)?.trim();
    if (!channel) return res.status(400).json({ error: "Missing channel" });

    // Get the user’s Twitch token
    const tokenRepo = AppDataSource.getRepository(OAuthToken);
    const tokenRecord = await tokenRepo.findOne({
      where: { user: { id: userId }, provider: OAuthProvider.TWITCH },
    });

    if (!tokenRecord)
      return res.status(401).json({ error: "Not authenticated with Twitch" });

    const token = tokenRecord.accessToken;

    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${channel}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        },
      }
    );
    const userData = await userRes.json();
    const user = userData.data?.[0];
    if (!user) return res.status(404).json({ error: "Channel not found" });

    // Check if live
    const streamRes = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        },
      }
    );

    const streamData = await streamRes.json();
    const stream = streamData.data?.[0];

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
    const vodRes = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${user.id}&first=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        },
      }
    );

    const vodData = await vodRes.json();
    const vod = vodData.data?.[0];

    if (!vod) return res.status(404).json({ error: "No videos found" });

    return res.json({
      videos: [
        {
          videoId: vod.id,
          title: vod.title,
          embedUrl: `https://player.twitch.tv/?video=${vod.id}&parent=localhost`,
        },
      ]
    });
  } catch (error) {
    console.error("Twitch search error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;