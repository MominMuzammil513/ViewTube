import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Toggle like on a video
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { _id: userId } = req.user; // Assuming authenticated user

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({ video: videoId, user: userId });

  if (existingLike) {
    await existingLike.remove(); // Unlike the video
    res
      .status(200)
      .json(new ApiResponse(200, null, "Video unliked successfully"));
  } else {
    const like = await Like.create({ video: videoId, user: userId });
    res
      .status(201)
      .json(new ApiResponse(201, like, "Video liked successfully"));
  }
});

// Toggle like on a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { _id: userId } = req.user; // Assuming authenticated user

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({ comment: commentId, user: userId });

  if (existingLike) {
    await existingLike.remove(); // Unlike the comment
    res
      .status(200)
      .json(new ApiResponse(200, null, "Comment unliked successfully"));
  } else {
    const like = await Like.create({ comment: commentId, user: userId });
    res
      .status(201)
      .json(new ApiResponse(201, like, "Comment liked successfully"));
  }
});

// Toggle like on a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { _id: userId } = req.user; // Assuming authenticated user

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({ tweet: tweetId, user: userId });

  if (existingLike) {
    await existingLike.remove(); // Unlike the tweet
    res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet unliked successfully"));
  } else {
    const like = await Like.create({ tweet: tweetId, user: userId });
    res
      .status(201)
      .json(new ApiResponse(201, like, "Tweet liked successfully"));
  }
});

// Get all liked videos by the user
const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id; // Assuming authenticated user
  if (!userId) {
    throw new ApiError(404, "User not authenticated");
  }
  //   const like = await Like.create({
  //     video: "66cb564da816821909173fff",
  //     likedBy: userId,
  //   });
  //   console.log("Created Like:", like);
  //   const likedVideoss = await Like.find({
  //     likedBy: userId,
  //     video: { $exists: true },
  //   }).exec();
  //   console.log("Liked Videos without populate:", likedVideoss);

  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $exists: true },
  })
    .populate("video", "title description") // Populate with video details
    .exec();

  //   console.log(likedVideos, "Liked videos...........");

  res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked videos retrieved successfully")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
