"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ormconfig_1 = require("../ormconfig");
const User_1 = require("../entities/User");
const requireUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies?.token ||
            (authHeader?.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : undefined);
        if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const userRepo = ormconfig_1.AppDataSource.getRepository(User_1.User);
        const user = await userRepo.findOne({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        req.user = { id: user.id };
        next();
    }
    catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};
exports.requireUser = requireUser;
