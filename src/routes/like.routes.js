import { Router } from "express";
import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
  } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

  const router = Router();

  // Routes for toggling likes
router.route("/video/:videoId/like").post(verifyJWT, toggleVideoLike);
router.route("/comment/:commentId/like").post(verifyJWT, toggleCommentLike);
router.route("/tweet/:tweetId/like").post(verifyJWT, toggleTweetLike);

// Route to get liked videos
router.route("/videos/liked").get(verifyJWT, getLikedVideos);

export default router;