import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to toggle subscription status for a channel
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { _id: subscriberId } = req.user; // Assuming the authenticated user is the subscriber

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check if the channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId,
    });

    if (existingSubscription) {
        // If subscription exists, remove it (unsubscribe)
        await existingSubscription.remove();
        res.status(200).json(
            new ApiResponse(200, null, "Successfully unsubscribed from the channel")
        );
    } else {
        // If subscription does not exist, create it (subscribe)
        const subscription = await Subscription.create({
            channel: channelId,
            subscriber: subscriberId,
        });
        res.status(201).json(
            new ApiResponse(201, subscription, "Successfully subscribed to the channel")
        );
    }
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check if the channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Find all subscribers for the channel
    const subscribers = await Subscription.find({ channel: channelId })
        .populate("subscriber", "username email")
        .exec();

    res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers retrieved successfully")
    );
});

// Controller to return the list of channels to which a user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // Check if the subscriber exists
    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }

    // Find all channels to which the user has subscribed
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "username email")
        .exec();

    res.status(200).json(
        new ApiResponse(200, subscriptions, "Subscribed channels retrieved successfully")
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};
