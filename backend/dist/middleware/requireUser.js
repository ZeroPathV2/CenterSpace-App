"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireUser = requireUser;
function requireUser(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    next();
}
