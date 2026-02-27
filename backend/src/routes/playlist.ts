import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { AppDataSource } from "../ormconfig";
import { PlaylistVideo } from "../entities/PlaylistVideo";

const router = Router()

router.post("/", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const { videoId, title, embedUrl } = req.body;

  const repo = AppDataSource.getRepository(PlaylistVideo);

  // prevent duplicates
  const exists = await repo.findOne({
    where: { videoId, user: { id: userId } },
  });

  if (exists) return res.json(exists);

  const video = repo.create({
    videoId,
    title,
    embedUrl,
    user: { id: userId },
  });

  await repo.save(video);
  res.json(video);
});

router.get("/", requireAuth, async (req, res) => {
  const userId = req.session.userId;

  const repo = AppDataSource.getRepository(PlaylistVideo);

  const videos = await repo.find({
    where: { user: { id: userId } },
  });

  res.json(videos);
});

// DELETE SINGLE VIA ID /playlist/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  const videoId = Number(req.params.id);

  const repo = AppDataSource.getRepository(PlaylistVideo);

  // Only delete if the video belongs to this user
  const result = await repo.delete({ id: videoId, user: { id: userId } });

  if (result.affected === 0)
    return res.status(404).json({ error: "Video not found" });

  res.json({ message: "Video removed" });
});

// CLEAR ALL
router.delete("/", requireAuth, async (req, res) => {
  const userId = req.session.userId;

  const repo = AppDataSource.getRepository(PlaylistVideo);

  await repo.delete({ user: { id: userId } });

  res.json({ message: "Playlist cleared" });
});

export default router