import express from "express";
import { githubCallback, discordCallback } from "../controllers/oauth.controller.js";

const router = express.Router();

router.post("/github", githubCallback);
router.post("/discord", discordCallback);

export default router;
