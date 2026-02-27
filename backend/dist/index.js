"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ormconfig_1 = require("./ormconfig");
const twitch_1 = __importDefault(require("./routes/twitch"));
const youtube_1 = __importDefault(require("./routes/youtube"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 3, // 3 hrs
        sameSite: "lax"
    }
}));
app.use("/twitch", twitch_1.default);
app.use("/youtube", youtube_1.default);
app.use("/auth", auth_1.default);
app.get("/", (_req, res) => {
    res.send("Backend is running.");
});
const PORT = process.env.PORT || 4000;
ormconfig_1.AppDataSource.initialize()
    .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
})
    .catch((err) => console.error(err));
