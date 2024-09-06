import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { healthcheck } from "../controllers/health.controller.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken); /// check after some time
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/update-account-details").patch(verifyJWT, updateAccountDetails);
router
  .route("/avatar")
  .patch(upload.single("avatar"), verifyJWT, updateUserAvatar);

router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);
router.route("/:videoId/comments").get(getVideoComments);
router.route("/:videoId/comments").post(verifyJWT, addComment);
router.route("/comments/:commentId").patch(verifyJWT, updateComment);
router.route("/comments/:commentId").delete(verifyJWT, deleteComment);

// Route to toggle subscription
router.route("/:channelId/subscribe").post(verifyJWT, toggleSubscription);

// Route to get subscribers of a channel
router
  .route("/:channelId/subscribers")
  .get(verifyJWT, getUserChannelSubscribers);

// Route to get channels a user has subscribed to
router
  .route("/:subscriberId/subscriptions")
  .get(verifyJWT, getSubscribedChannels);
router.route("/healthcheck").get(healthcheck);
// {
//   "statusCode": 200,
//   "data": null,
//   "message": "Service is running smoothly",
//   "success": true
// }

router.route("/").post(createPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);
router
  .route("/:playlistId/video/:videoId")
  .post(addVideoToPlaylist)
  .delete(removeVideoFromPlaylist);

///

///

router.route("/").post(createTweet);
router.route("/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
