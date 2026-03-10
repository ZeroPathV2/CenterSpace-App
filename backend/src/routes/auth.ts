import { Router } from "express";
import bcrypt from "bcrypt";
import { AppDataSource } from "../ormconfig";
import { User } from "../entities/User";
import jwt, { SignOptions } from "jsonwebtoken"
import { AuthRequest, requireUser } from "../middleware/auth";

const router = Router();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in .env");
}
const JWT_SECRET: string = process.env.JWT_SECRET!
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN!

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = userRepo.create({ email, password: hashed})
    await userRepo.save(newUser);

    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions)

    // HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 3 // 3h
    });

    res.json({ message: "User registered"});

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN} as SignOptions)

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
router.get("/me", requireUser, async (req: AuthRequest, res) => {
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ userId: user.id, email: user.email });
});

export default router;