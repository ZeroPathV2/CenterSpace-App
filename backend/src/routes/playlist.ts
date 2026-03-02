import { Request, Response, Router } from "express";
import { AppDataSource } from "../ormconfig";
import { PlaylistItem } from "../entities/PlaylistItem";
import { requireUser } from "../middleware/requireUser";
import asyncHandler from "../utils/asyncHandler";

const router = Router()

router.post("/", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;
  const { platform, playlistItemId, title, embedUrl } = req.body;

  const repo = AppDataSource.getRepository(PlaylistItem);

  // prevent duplicates
  const exists = await repo.findOne({
    where: { playlistItemId, user: { id: userId } },
  });

  if (exists) return res.json(exists);

  const item = repo.create({
    platform,
    playlistItemId,
    title,
    embedUrl,
    user: { id: userId },
  })

  await repo.save(item);
  res.json(item);
}))

router.get("/", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;

  const repo = AppDataSource.getRepository(PlaylistItem);

  const item = await repo.find({
    // order: { position: "ASC" },
    where: { user: { id: userId } },
  });

  res.json(item);
}))

// CHANGE - what are "transactional updates"
router.put("/reorder", requireUser, asyncHandler(async (req: Request, res: Response)=>{
  const { items } = req.body;

  const repo = AppDataSource.getRepository(PlaylistItem)

  for (const item of items) {
    await repo.update(
      { id: item.id },
      { position: item.position }
    );
  }

  res.json({ success:true });
}));

// DELETE SINGLE VIA ID /playlist/:id
router.delete("/:id", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;
  const itemId = Number(req.params.id);

  const repo = AppDataSource.getRepository(PlaylistItem);

  // Only delete if the item belongs to this user
  const result = await repo.delete({ id: itemId, user: { id: userId } });

  if (result.affected === 0)
    return res.status(404).json({ error: "Item not found" });

  res.json({ message: "Item removed" });
}))

// CLEAR ALL
router.delete("/", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.session.userId;

  const repo = AppDataSource.getRepository(PlaylistItem);

  await repo.delete({ user: { id: userId } });

  res.json({ message: "Playlist cleared" });
}))

export default router