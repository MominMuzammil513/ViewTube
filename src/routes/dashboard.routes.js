import { Router } from "express";
import {
    getChannelStats,
    getChannelVideos,
  } from "../controllers/dashboard.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
  const router = Router();
// Route to get channel stats
router.route("/:userId/stats").get(verifyJWT, getChannelStats);

// Route to get all videos of the channel
router.get("/:userId/videos", verifyJWT, getChannelVideos);
export default router;