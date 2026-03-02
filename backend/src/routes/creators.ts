import { Request, Response, Router } from "express";
import { requireUser } from "../middleware/requireUser";
import asyncHandler from "../utils/asyncHandler";
import { AppDataSource } from "../ormconfig";
import { Creator } from "../entities/Creator";

const router = Router()
const creatorRepo = AppDataSource.getRepository(Creator)

router.post("/", requireUser, asyncHandler(async (req: Request, res: Response)=>{
  const { platform, playlistItemId, name } = req.body;
  
  const creator = creatorRepo.create({
    platform,
    playlistItemId,
    name
  });

  await creatorRepo.save(creator);

  res.json(creator);
}));

router.get("/", requireUser, asyncHandler(async (req: Request, res: Response)=>{
  const creators = await creatorRepo.find();
  res.json(creators);
}));

export default router