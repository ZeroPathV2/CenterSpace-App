import { Request, Response, NextFunction } from "express";

export function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  next();
}