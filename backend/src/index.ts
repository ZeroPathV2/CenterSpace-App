import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import { AppDataSource } from "./ormconfig";
import twitchRouter from "./routes/twitch";
import youtubeRouter from "./routes/youtube";
import authRouter from './routes/auth'
import cors from "cors"

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 3, // 3 hrs
      sameSite: "lax"
    }
  })
);

app.use("/twitch", twitchRouter);
app.use("/youtube", youtubeRouter);
app.use("/auth", authRouter)

app.get("/", (_req, res) => {
    res.send("Backend is running.")
})

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => console.error(err));