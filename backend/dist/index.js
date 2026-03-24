"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
// import session from "express-session";
const ormconfig_1 = require("./ormconfig");
const twitch_1 = __importDefault(require("./routes/twitch"));
const youtube_1 = __importDefault(require("./routes/youtube"));
const auth_1 = __importDefault(require("./routes/auth"));
const playlist_1 = __importDefault(require("./routes/playlist"));
const creators_1 = __importDefault(require("./routes/creators"));
const cors_1 = __importDefault(require("cors"));
const redis_1 = require("./redis");
// import { startLiveChecker } from "./workers/liveChecker";
const lookup_1 = __importDefault(require("./routes/lookup"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/auth", auth_1.default);
app.use("/twitch", twitch_1.default);
app.use("/youtube", youtube_1.default);
app.use("/playlist", playlist_1.default);
app.use("/creators", creators_1.default);
app.use("/lookup", lookup_1.default);
app.get("/", (_req, res) => {
    res.send(`Backend is running.`);
});
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        error: "Internal server error"
    });
});
const PORT = process.env.PORT || 4000;
async function startServer() {
    try {
        await (0, redis_1.connectRedis)();
        await ormconfig_1.AppDataSource.initialize();
        console.log("Database connected");
        // startLiveChecker()
        app.listen(PORT, () => console.log(`Server running on ${PORT}`));
    }
    catch (err) {
        console.error("Failed to start server.", err);
    }
}
startServer();
