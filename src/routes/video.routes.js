import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Define routes for video-related operations
router.route("/").get(verifyJWT,getAllVideos); // Get all videos with optional filters and pagination
router.post(
  "/publish",
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyJWT,
  publishAVideo
);
router.route("/:videoId").get(getVideoById); // Get video details by ID
router.route("/:videoId").patch(
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  verifyJWT,
  updateVideo
); // Update video details
router.route("/:videoId").delete(verifyJWT, deleteVideo); // Delete a video

router.route("/:videoId/toggle-publish").patch(togglePublishStatus); // Toggle video publish status

export default router;
