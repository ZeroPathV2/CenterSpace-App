import { Response, Router } from "express";
import { AuthRequest, requireUser } from "../middleware/auth";
import asyncHandler from "../utils/asyncHandler";
import { AppDataSource } from "../ormconfig";
import { Creator } from "../entities/Creator";
import { Favourite } from "../entities/Favourite";
import { PlatformAccount } from "../entities/PlatformAccount";

const router = Router();
const creatorRepo = AppDataSource.getRepository(Creator);
const accountRepo = AppDataSource.getRepository(PlatformAccount);
const favouriteRepo = AppDataSource.getRepository(Favourite);

router.post("/favourite", requireUser, asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, platform, channel } = req.body;
    const userId = req.user!.id;

    if (!name || !platform || !channel) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 1️⃣ Find or create creator
    let creator = await creatorRepo.findOne({
      where: { name },
      relations: { platformAccounts: true },
    });

    if (!creator) {
      creator = creatorRepo.create({ name });
      creator.platformAccounts = []
      await creatorRepo.save(creator);
    }

    // 2️⃣ Find or create platform account
    let account = creator.platformAccounts?.find(
      (acc) => acc.platform === platform && acc.channel === channel
    );

    if (!account) {
      account = accountRepo.create({
        platform,
        channel,
        creator,
      });
      await accountRepo.save(account);
      creator.platformAccounts.push(account)
    }

    // 3️⃣ Check if favourite already exists for this user & creator
    const existingFav = await favouriteRepo.findOne({
      where: {
        user: { id: userId },
        creator: { id: creator.id },
      },
    });

    if (existingFav) {
      return res.json({
        message: "Already favourited",
        creator,
      });
    }

    // 4️⃣ Create favourite
    const fav = favouriteRepo.create({
      user: { id: userId },
      creator,
    });

    await favouriteRepo.save(fav);

    res.json({
      message: "Creator favourited",
      creator,
    });
  })
);

router.get("/favourites", requireUser, asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const favourites = await favouriteRepo.find({
      where: { user: { id: userId } },
      relations: {
        creator: {
          platformAccounts: true,
        },
      },
    });

    res.json(favourites);
  })
);

export default router;