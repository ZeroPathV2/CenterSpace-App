"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ormconfig_1 = require("../ormconfig");
const User_1 = require("../entities/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be set in .env");
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Missing fields" });
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: "User already exists" });
        const hashed = await bcrypt_1.default.hash(password, 10);
        const newUser = userRepo.create({ email, password: hashed });
        await userRepo.save(newUser);
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        // HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 3 // 3h
        });
        res.json({ message: "User registered" });
    }
    catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { email } });
        if (!user)
            return res.status(400).json({ error: "Invalid credentials" });
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ error: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 3 // 3h
        });
        res.json({ message: "Logged in" });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// LOGOUT
router.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.json({ message: "Logged out" });
});
// CHECK SESSION
router.get("/me", auth_1.requireUser, async (req, res) => {
    const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
    const user = await userRepo.findOne({ where: { id: req.user.id } });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    res.json({ userId: user.id, email: user.email });
});
exports.default = router;
