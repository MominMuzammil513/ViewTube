import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get channel stats like total video views, total subscribers, total videos, total likes, etc.
const getChannelStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // No need to check ObjectId validity since owner is a string
    if (typeof userId !== 'string') {
        throw new ApiError(400, "Invalid user ID");
    }

    try {
        const totalVideos = await Video.countDocuments({ owner: userId });
        console.log(`Total Videos: ${totalVideos}`);

        const totalViewsResult = await Video.aggregate([
            { $match: { owner: userId } }, // Direct string match
            { $group: { _id: null, totalViews: { $sum: "$views" } } }
        ]);
        const totalViews = totalViewsResult[0]?.totalViews || 0;
        console.log(`Total Views: ${totalViews}`);

        const totalSubscribers = await Subscription.countDocuments({ channel: userId });
        console.log(`Total Subscribers: ${totalSubscribers}`);

        const videoIds = await Video.find({ owner: userId }).select("_id");
        const totalLikes = await Like.countDocuments({
            video: { $in: videoIds }
        });
        console.log(`Total Likes: ${totalLikes}`);

        res.status(200).json(
            new ApiResponse(
                200,
                {
                    totalVideos,
                    totalViews,
                    totalSubscribers,
                    totalLikes
                },
                "Channel stats retrieved successfully"
            )
        );
    } catch (error) {
        console.error("Error retrieving channel stats:", error);
        throw new ApiError(500, "Error retrieving channel stats");
    }
});


// Get all videos uploaded by the channel
const getChannelVideos = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (typeof userId !== 'string') {
        throw new ApiError(400, "Invalid user ID");
    }

    const videos = await Video.find({ owner: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalVideos = await Video.countDocuments({ owner: userId });

    res.status(200).json(
        new ApiResponse(
            200,
            { videos, totalVideos },
            "Channel videos retrieved successfully"
        )
    );
});


export {
    getChannelStats,
    getChannelVideos,
};
