import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";

interface JwtPayload {
  userId: number;
}

export interface AuthRequest extends Request {
  user?: { id: number };
}

export const requireUser = async ( req: AuthRequest, res: Response, next: NextFunction ) => {
  try {
    const authHeader = req.headers.authorization;

    const token =
      req.cookies?.token ||
      (authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : undefined);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = { id: user.id };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};