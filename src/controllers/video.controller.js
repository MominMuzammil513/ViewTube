import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all videos with query, sort, and pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const filter = {
        title: { $regex: query, $options: "i" },
        ...(userId && isValidObjectId(userId) && { owner: userId }), // Use 'owner' instead of 'user'
    };

    const sortOptions = { [sortBy]: sortType === "desc" ? -1 : 1 };

    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("owner", "username"); // Use 'owner' instead of 'user'

    const totalVideos = await Video.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, { videos, totalVideos }, "Videos retrieved successfully"));
});

// Publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new ApiError(401, "Authentication required");
    }
    const { title, description } = req.body;

    if (!title || !req.files || !req.files.videoFile || !req.files.thumbnail) {
        throw new ApiError(400, "Title, video file, and thumbnail are required");
    }

    const videoLocalPath = req.files.videoFile[0].path;
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    const videoFile = await uploadOnCloudinary(videoLocalPath,"video");
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath,"image");

    if (!videoFile || !thumbnail) {
        throw new ApiError(500, "Error uploading video or thumbnail to Cloudinary");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration, // Assuming Cloudinary returns duration
        owner: req.user._id, // Assuming you have user authentication middleware
    });

    res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    console.log("Requested videoId:", videoId);

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId).populate("owner", "username");
    console.log("Found video:", video);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video retrieved successfully"));
});

// Update video details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const updatedFields = { title, description };
    if (thumbnail) {
        updatedFields.thumbnail = thumbnail;
    }

    const video = await Video.findByIdAndUpdate(videoId, updatedFields, {
        new: true,
        runValidators: true,
    });

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});
////
// const updateVideo = asyncHandler(async (req, res) => {
//     const { videoId } = req.params;
//     const { title, description } = req.body;

//     console.log("Updating video. VideoId:", videoId);
//     console.log("Update data:", { title, description });

//     if (!isValidObjectId(videoId)) {
//         throw new ApiError(400, "Invalid video ID");
//     }

//     // Check if the video exists and belongs to the current user
//     const existingVideo = await Video.findOne({ _id: videoId, owner: req.user._id });
//     if (!existingVideo) {
//         throw new ApiError(404, "Video not found or you don't have permission to update it");
//     }

//     const updatedFields = {};
//     if (title) updatedFields.title = title;
//     if (description) updatedFields.description = description;

//     // Handle thumbnail update if a new file is uploaded
//     if (req.files && req.files.thumbnail) {
//         const thumbnailLocalPath = req.files.thumbnail[0].path;
//         const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
//         if (thumbnail) {
//             updatedFields.thumbnail = thumbnail.url;
//         }
//     }

//     console.log("Fields to update:", updatedFields);

//     const updatedVideo = await Video.findByIdAndUpdate(
//         videoId,
//         { $set: updatedFields },
//         { new: true, runValidators: true }
//     );

//     console.log("Updated video:", updatedVideo);

//     if (!updatedVideo) {
//         throw new ApiError(500, "Failed to update video");
//     }

//     res.status(200).json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
// });
////
// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json(new ApiResponse(200, null, "Video deleted successfully"));
});

// Toggle publish status of a video
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    res.status(200).json(new ApiResponse(200, video, "Video publish status updated successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
