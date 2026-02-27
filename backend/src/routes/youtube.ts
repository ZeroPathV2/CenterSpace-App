import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const { YOUTUBE_API_KEY } = process.env;
if (!YOUTUBE_API_KEY) throw new Error("Missing YOUTUBE_API_KEY");

router.get("/search", requireAuth, async (req, res) => {
  try {
    const channel = (req.query.channel as string)?.trim();
    if (!channel) return res.status(400).json({ error: "Missing channel" });

    // Step 1: Search channel
    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
        channel
      )}&key=${YOUTUBE_API_KEY}`
    );

    const searchData = await searchRes.json();
    if (!searchData.items || searchData.items.length === 0)
      return res.status(404).json({ error: "Channel not found" });

    const channelId = searchData.items[0].snippet.channelId;

    // Step 2: Get uploads playlist
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0)
      return res.status(404).json({ error: "Channel not found" });

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Step 3: Get videos from playlist (just first video if you want one)
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=1&playlistId=${uploadsPlaylistId}&key=${YOUTUBE_API_KEY}`
    );

    const playlistData = await playlistRes.json();
    const videos = playlistData.items?.map((v: any) => ({
      videoId: v.contentDetails.videoId,
      title: v.snippet.title,
      embedUrl: `https://www.youtube.com/embed/${v.contentDetails.videoId}`,
    }));

    if (!videos || videos.length === 0)
      return res.status(404).json({ error: "No videos found" });

    res.json({
      platform: "youtube",
      videos,
    });
  } catch (error) {
    console.error("YouTube fetch failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;