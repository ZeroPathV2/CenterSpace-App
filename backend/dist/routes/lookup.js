"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = (0, express_1.Router)();
// console.log(process.env.DVLA_API_KEY)
router.post("/:reg", (0, asyncHandler_1.default)(async (req, res) => {
    const reg = req.params.reg;
    // console.log("Reg From Console:",reg)
    return res.status(200).json({ reg });
}));
router.get("/:reg", auth_1.requireUser, (0, asyncHandler_1.default)(async (req, res) => {
    let reg = req.params.reg;
    if (Array.isArray(reg))
        reg = reg[0];
    reg = reg.trim().replace(/\s+/g, "").toUpperCase();
    // Validate format
    if (!/^[A-Z0-9]{1,10}$/.test(reg)) {
        return res.status(400).json({ error: "Invalid registration number format" });
    }
    const dvlaRes = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.DVLA_API_KEY
        },
        body: JSON.stringify({ registrationNumber: reg })
    });
    // DEBUG: check status and raw body
    console.log("Sending to DVLA:", reg);
    //   const raw = await dvlaRes.json()
    //   console.log("Raw:",raw);
    const text = await dvlaRes.text();
    console.log("DVLA status:", dvlaRes.status, dvlaRes.statusText, text);
    let data;
    try {
        data = JSON.parse(text);
    }
    catch {
        return res.status(500).json({ error: "Invalid response from DVLA", raw: text });
    }
    if (!data.registrationNumber) {
        return res.status(404).json({ error: "Vehicle not found" });
    }
    return res.json(data);
}));
exports.default = router;
