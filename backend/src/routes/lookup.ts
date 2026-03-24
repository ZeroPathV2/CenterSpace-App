import dotenv from "dotenv";
dotenv.config();

import { Response, Router } from "express";
import { AuthRequest, requireUser } from "../middleware/auth";
import asyncHandler from "../utils/asyncHandler";

const router = Router()

// console.log(process.env.DVLA_API_KEY)

router.post("/:reg", asyncHandler(async(req: AuthRequest, res:Response) => {
    const reg = req.params.reg

    // console.log("Reg From Console:",reg)

    return res.status(200).json({ reg })
}))

router.get("/:reg",requireUser, asyncHandler(async (req: AuthRequest, res: Response) => {
  let reg = req.params.reg;
  if (Array.isArray(reg)) reg = reg[0];

  reg = reg.trim().replace(/\s+/g, "").toUpperCase();

  // Validate format
  if (!/^[A-Z0-9]{1,10}$/.test(reg)) {
    return res.status(400).json({ error: "Invalid registration number format" });
  }

  const dvlaRes = await fetch(
    "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.DVLA_API_KEY!
      },
      body: JSON.stringify({ registrationNumber: reg })
    }
  );

  console.log("Sending to DVLA:", reg);
  
  const text = await dvlaRes.text()
  console.log("DVLA status:", dvlaRes.status, dvlaRes.statusText,text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return res.status(500).json({ error: "Invalid response from DVLA", raw: text });
  }

  if (!data.registrationNumber) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  return res.json(data);
}));
export default router