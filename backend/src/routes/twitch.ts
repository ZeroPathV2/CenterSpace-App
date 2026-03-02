import dotenv from "dotenv";
dotenv.config();

import { Request, Response, Router } from "express";
import { AppDataSource } from "../ormconfig";
import { OAuthToken } from "../entities/OAuthToken";
import { OAuthProvider } from "../entities/OAuthProvider";

import asyncHandler from '../utils/asyncHandler'
import crypto from "crypto";
import { redisClient } from "../redis";
import { requireUser } from "../middleware/requireUser";

const router = Router();

// const {TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI} = process.env

if (!process.env.FRONTEND_HOST! || !process.env.FRONTEND_PORT!) {
  throw new Error("Invalid host environment.");
}

// console.log("Parent:",`parent=${process.env.FRONTEND_HOST!}&parent=${process.env.FRONTEND_HOST!}:${process.env.FRONTEND_PORT!}`);

const parentParam = `parent=localhost` // &parent=${process.env.FRONTEND_HOST!}:${process.env.FRONTEND_PORT!}

router.get("/connect", asyncHandler(async (req: Request,res: Response)=>{

  const state = crypto.randomUUID();
  const userId = req.session?.userId;

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

  res.redirect(url);
}));

router.get("/callback", asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;
    const userId = await redisClient.get(`oauth:${state}`);

    if (!code || !userId) {
      return res.status(400).json({ error: "Invalid request" });
    }

    await redisClient.del(`oauth:${state}`);

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
    })

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return res.status(400).json(tokenData);
    }

    const tokenRepo = AppDataSource.getRepository(OAuthToken);
    await tokenRepo.save({
      user: { id: Number(userId) },
      provider: OAuthProvider.TWITCH,
      accessToken: tokenData.access_token,
    });

    res.redirect("http://localhost:3000");

}))

router.get("/search", requireUser, asyncHandler(async (req: Request, res: Response) => {
    const userId = req.session?.userId;
    if (!userId){ return res.status(401).json({ error: "Not logged in" })}

    const channel = (req.query.channel as string)?.trim();
    if (!channel){ return res.status(400).json({ error: "Missing channel" })}

    // Get the user’s Twitch token
    const tokenRepo = AppDataSource.getRepository(OAuthToken);
    const tokenRecord = await tokenRepo.findOne({
      where: { user: { id: userId }, provider: OAuthProvider.TWITCH },
    })

    if (!tokenRecord)
      return res.status(401).json({ error: "Not authenticated with Twitch" })

    const token = tokenRecord.accessToken;

    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${channel}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        }
      }
    )

    if(!userRes.ok){
      const text = await userRes.text()
      console.error("Twitch API Failed.",text)
      return res.status(userRes.status).json({ error: "Twitch API error", details: text });
    }

    const userData = await userRes.json();
    const user = userData.data?.[0];
    if (!user){ 
      return res.status(404).json({ error: "Channel not found" })}

    // Check if live
    const streamRes = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        }
      }
    )

    if(!streamRes.ok){
      const text = await streamRes.text()
      console.error("Twitch API failed:", text);
      return res.status(500).json({ error: "Twitch API error" });
    }

    const streamData = await streamRes.json();
    const stream = streamData.data?.[0];

    // console.log(`embedUrl: https://player.twitch.tv/?channel=${channel}&${parentParam}`)
    if (stream) {
      return res.json({
        videos: [
          {
            platform: "twitch",
            playlistItemId: stream.id,
            title: stream.title,
            embedUrl: `https://player.twitch.tv/?channel=${channel}&${parentParam}`,
          }
        ]
      })
    }

    // Latest VOD
    const vodRes = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${user.id}&first=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID!,
        }})

    if(!vodRes.ok){
      const text = await vodRes.text()
      console.error("Twitch API Failed.",text)
      return res.status(vodRes.status).json({ error: "Twitch API error", details: text });
    }

    const vodData = await vodRes.json();
    const vod = vodData.data?.[0];

    if (!vod) return res.status(404).json({ error: "No videos found" });

    return res.json({
      videos: [
        {
          platform: 'twitch',
          playlistItemId: vod.id,
          title: vod.title,
          embedUrl: `https://player.twitch.tv/?video=${vod.id}&${parentParam}`,
        }
      ]
    })
}))

export default router;