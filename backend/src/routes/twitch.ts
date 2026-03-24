import dotenv from "dotenv";
dotenv.config();

import { Request, Response, Router } from "express";
import { AppDataSource } from "../ormconfig";
import { OAuthToken } from "../entities/OAuthToken";
import { OAuthProvider } from "../entities/OAuthProvider";

import asyncHandler from '../utils/asyncHandler'
import crypto from "crypto";
import { redisClient } from "../redis";
import { requireUser } from "../middleware/auth"
import { AuthRequest } from "../middleware/auth";
import { channel } from "diagnostics_channel";

const router = Router();

// const {TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI} = process.env

if (!process.env.FRONTEND_HOST! || !process.env.FRONTEND_PORT!) {
  throw new Error("Invalid host environment.");
}

// console.log("Parent:",`parent=${process.env.FRONTEND_HOST!}&parent=${process.env.FRONTEND_HOST!}:${process.env.FRONTEND_PORT!}`);

const parentParam = `parent=localhost` // &parent=${process.env.FRONTEND_HOST!}:${process.env.FRONTEND_PORT!}
const tokenRepo = AppDataSource.getRepository(OAuthToken);

router.get("/connect",requireUser, asyncHandler(async (req: AuthRequest,res: Response)=>{
  const state = crypto.randomUUID();
  const userId = req.user!.id;

  if (!userId) {
    return res.status(401).json({ error: "Not logged in" });
  }

  await redisClient.set(`oauth:${state}`, String(userId),{
    EX: 300 
  })

  const url =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${process.env.TWITCH_CLIENT_ID!}` +
    `&redirect_uri=${process.env.TWITCH_REDIRECT_URI!}` +
    `&response_type=code` +
    `&scope=user:read:email` +
    `&state=${state}`;

  return res.redirect(url);
}));

router.get("/callback", asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (!code || !state) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const userId = await redisClient.get(`oauth:${state}`);
    if (!userId) {
      return res.status(400).json({ error: "Invalid state" });
    }

    await redisClient.del(`oauth:${state}`);

    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID!,
        client_secret: process.env.TWITCH_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.TWITCH_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) return res.status(400).json(tokenData)
    
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    const existing = await tokenRepo.findOne({
      where: { user: { id: Number(userId) }, provider: OAuthProvider.TWITCH }
    })
    if (existing) {
      existing.accessToken = tokenData.access_token;
      existing.refreshToken = tokenData.refresh_token;
      existing.expiresAt = expiresAt;
      await tokenRepo.save(existing);
    } else {
      await tokenRepo.save({
        user: { id: Number(userId) },
        provider: OAuthProvider.TWITCH,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt,
      });
    }

    res.redirect(`http://${process.env.FRONTEND_HOST}:${process.env.FRONTEND_PORT}`);
  })
)

// GET VODs or Live stream with optional index
router.get("/search", requireUser, asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const channel = (req.query.channel as string)?.trim();
  const index = req.query.index !== undefined ? Number(req.query.index) : 0;

  if (!channel) return res.status(400).json({ error: "Missing channel" });

  const tokenRepo = AppDataSource.getRepository(OAuthToken);
  const tokenRecord = await tokenRepo.findOne({
    where: { user: { id: userId }, provider: OAuthProvider.TWITCH },
  });

  if (!tokenRecord) return res.status(401).json({ error: "Not authenticated with Twitch" });

  const token = tokenRecord.accessToken;

  // Get Twitch user
  const userRes = await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
    },
  });

  const userData = await userRes.json();
  const userObj = userData.data?.[0];
  if (!userObj) return res.status(404).json({ error: "Channel not found" });

  // Check live
  const streamRes = await fetch(`https://api.twitch.tv/helix/streams?user_id=${userObj.id}`, {
    headers: { Authorization: `Bearer ${token}`, "Client-Id": process.env.TWITCH_CLIENT_ID! },
  });
  const streamData = await streamRes.json();
  const stream = streamData.data?.[0];
  
//  type = 'live'?
  if (stream) {
    return res.json({
      videos: [{
        platform: "twitch",
        channel: stream.user_login,
        title: stream.title,
        playlistItemId: stream.id,
        embedUrl: `https://player.twitch.tv/?channel=${stream.user_login}&parent=localhost&autoplay=false`,
      }],
    });
  }

  // Get latest VODs
  const vodRes = await fetch(`https://api.twitch.tv/helix/videos?user_id=${userObj.id}&first=20`, {
    headers: { Authorization: `Bearer ${token}`, "Client-Id": process.env.TWITCH_CLIENT_ID! },
  });
  const vodData = await vodRes.json();
  const vods = vodData.data || [];
  const vid = vods[Math.min(index, vods.length - 1)];

  if (!vid) return res.status(404).json({ error: "No videos found" });

  res.json({
    videos: [{
      platform: "twitch",
      channel: vid.user_login,
      title: vid.title,
      playlistItemId: vid.id,
      embedUrl: `https://player.twitch.tv/?video=${vid.id}&parent=localhost&autoplay=false`,
    }],
  });
}));

router.get("/live", requireUser, asyncHandler(async (req: AuthRequest, res: Response) => {
  const channel = req.query.channel as string;
  if (!channel) return res.status(400).json({ error: "Missing channel" });

  // Fetch Twitch token
  const tokenRepo = AppDataSource.getRepository(OAuthToken);
  const tokenRecord = await tokenRepo.findOne({
    where: { user: { id: req.user!.id }, provider: OAuthProvider.TWITCH },
  });
  if (!tokenRecord) return res.status(401).json({ error: "Not authenticated with Twitch" });

  const twitchRes = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channel}`, {
    headers: {
      "Authorization": `Bearer ${tokenRecord.accessToken}`,
      "Client-Id": process.env.TWITCH_CLIENT_ID!,
    },
  });

  if (!twitchRes.ok) throw new Error("Is Live Response Failed");

  const data = await twitchRes.json();
  const video = data.data?.[0]; // optional chaining, safe even if array is empty
  console.log("Video:", video);

  const isLive = video?.type === "live"; // safe: undefined => false

  if (!isLive) {
    return res.status(200).json({ channel, isLive: false, embedUrl: null });
  }

  const embedUrl = `https://player.twitch.tv/?channel=${video.user_login}&parent=localhost&autoplay=false`;
  res.json({ channel, isLive, embedUrl });
}));

// Twitch Feilds

//   id: '2720939962',
//   stream_id: '317050215511',
//   user_id: '88946548',
//   user_login: 'aceu',
//   user_name: 'aceu',
//   title: 'PICK UP THE PACE PICK UP THE PACE',
//   description: '',
//   created_at: '2026-03-13T02:30:19Z',
//   published_at: '2026-03-13T02:30:19Z',
//   url: 'https://www.twitch.tv/videos/2720939962',
//   thumbnail_url: 'https://static-cdn.jtvnw.net/cf_vods/d2nvs31859zcd8/c620cdf1d38720670137_aceu_317050215511_1773369014//thumb/thumb0-%{width}x%{height}.jpg',
//   viewable: 'public',
//   view_count: 86560,
//   language: 'en',
//   type: 'archive',
//   duration: '8h10m0s',
//   muted_segments: null

// OR

// id: '316486277607',
//   user_id: '131851325',
//   user_login: 'knightmar3frame',
//   user_name: 'knightmar3frame',
//   game_id: '66170',
//   game_name: 'Warframe',
//   type: 'live',
//   title: '!wpnuke !gara⚡️new week, i play game, you watch?',
//   viewer_count: 114,
//   started_at: '2026-03-16T11:28:22Z',
//   language: 'en',
//   thumbnail_url: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_knightmar3frame-{width}x{height}.jpg',
//   tag_ids: [],
//   tags: [
//     'frame',
//     'helping',
//     'playingwithviewers',
//     'READ',
//     'NoBackseating',
//     'knightmareframe',
//     'English',
//     'braincellsrequired'
//   ],
//   is_mature: true

export default router;