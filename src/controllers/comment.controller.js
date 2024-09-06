import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all comments for a video
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    const comments = await Comment.find({ video: videoId })
        .sort({ createdAt: -1 }) // Sort by newest comments first
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const totalComments = await Comment.countDocuments({ video: videoId });

    res.status(200).json(
        new ApiResponse(200, { comments, totalComments }, "Comments retrieved successfully")
    );
});

// Add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!text) {
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.create({
        video: videoId,
        user: userId,
        text,
    });

    res.status(201).json(
        new ApiResponse(201, comment, "Comment added successfully")
    );
});

// Update a comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, user: userId },
        { text },
        { new: true }
    );

    if (!comment) {
        throw new ApiError(404, "Comment not found or you do not have permission to edit this comment");
    }

    res.status(200).json(
        new ApiResponse(200, comment, "Comment updated successfully")
    );
});

// Delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        user: userId,
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found or you do not have permission to delete this comment");
    }

    res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});

export {
    getVideoComments, 
    addComment, 
    updateComment, 
    deleteComment
};
