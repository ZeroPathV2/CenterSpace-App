"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const ormconfig_1 = require("../ormconfig");
const User_1 = require("../entities/User");
const router = (0, express_1.Router)();
const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: "Missing fields" });
        const existingUser = await userRepo.findOne({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: "User already exists" });
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = userRepo.create({
            email,
            password: hashedPassword,
        });
        await userRepo.save(newUser);
        req.session.userId = newUser.id;
        res.json({ message: "User registered", userId: newUser.id });
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
        const user = await userRepo.findOne({ where: { email } });
        if (!user)
            return res.status(400).json({ error: "Invalid credentials" });
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            return res.status(400).json({ error: "Invalid credentials" });
        req.session.userId = user.id;
        res.json({ message: "Logged in", userId: user.id });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// LOGOUT
router.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out" });
    });
});
// CHECK SESSION
router.get("/me", async (req, res) => {
    if (!req.session.userId)
        return res.status(401).json({ error: "Not logged in" });
    const user = await userRepo.findOne({
        where: { id: req.session.userId },
    });
    res.json({ user });
});
exports.default = router;
