import { Router } from "express";
import { AppDataSource } from "../ormconfig";
import { OAuthToken } from "../entities/OAuthToken";
import { OAuthProvider } from "../entities/OAuthProvider";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

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
      platform: "twitch",
      videos: [
        {
          videoId: vod.id,
          title: vod.title,
          embedUrl: `https://player.twitch.tv/?video=${vod.id}&parent=localhost`,
        },
      ],
    });
  } catch (error) {
    console.error("Twitch search error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;