import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import { AppDataSource } from "./ormconfig";

import twitchRouter from "./routes/twitch";

import youtubeRouter from "./routes/youtube";
import authRouter from './routes/auth'

import playlistRoute from './routes/playlist'
import creatorsRoute from './routes/creators'

import cors from "cors"
import { RedisStore } from "connect-redis";
import { connectRedis, redisClient } from "./redis";
import { startLiveChecker } from "./workers/liveChecker";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 3
    }
  })
);

app.use("/auth", authRouter)
app.use("/twitch", twitchRouter)
app.use("/youtube", youtubeRouter)
app.use("/playlist", playlistRoute)
app.use("/creators", creatorsRoute)

app.get("/", (_req, res) => {
    res.send(`Backend is running.`)
})

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);

  res.status(500).json({
    error: "Internal server error"
  });
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectRedis()
    await AppDataSource.initialize()
        console.log("Database connected");
        
        startLiveChecker()

        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  }
  catch(err) {
    console.error("Failed to start server.",err)
  }
}

startServer()
