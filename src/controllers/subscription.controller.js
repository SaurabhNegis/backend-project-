import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params; // Extract the channelId from route params
    const subscriberId = req.user._id; // Get the authenticated user's ID

    // Validate channelId
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID.");
    }

    // Ensure the subscriber and channel are not the same
    if (subscriberId.toString() === channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself.");
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if (existingSubscription) {
        // If the subscription exists, delete it (unsubscribe)
        await existingSubscription.deleteOne();
        res.status(200).json({
            success: true,
            message: "Unsubscribed successfully.",
        });
    } else {
        // If it does not exist, create a new subscription
        await Subscription.create({
            subscriber: new mongoose.Types.ObjectId(subscriberId),
            channel:  new mongoose.Types.ObjectId(channelId),
        });

    }
    res.status(200)
    .json(new ApiResponce(201, "subscribed successfully.", existingSubscription  ));

});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // Validate channelId
    const channelExists = await Subscription.exists({ channel: channelId });
if (!channelExists) {
    return res.status(404).json({
        success: false,
        message: "Channel not found.",
    });
}
    if (!mongoose.isValidObjectId(channelId)) {
        return res
            .status(400)
            .json({ success: false, message: "Invalid channel ID format." });
    }


    // Aggregation pipeline to fetch subscribers
    const pipeline = [
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }, // Match subscriptions for the given channel
        },
        {
            $lookup: {
                from: "users", // Name of the users collection
                localField: "subscriber", // Field in subscriptions referencing users
                foreignField: "_id", // Field in users being referenced
                as: "subscriberDetails", // Name of the field to populate
            },
        },
        {
            $unwind: "$subscriberDetails", // Flatten the array of subscriber details
        },
        {
            $project: {
                _id: 0, // Exclude subscription ID
                subscriberId: "$subscriberDetails._id", // Include subscriber ID
                fullName: "$subscriberDetails.name", // Include subscriber name
                email: "$subscriberDetails.email", // Include subscriber email
                subscribedAt: "$createdAt", // Include subscription timestamp
            },
        },
    ];

    // Execute the aggregation pipeline
    const subscribers = await Subscription.aggregate(pipeline);

    // Respond with the list of subscribers
    res.status(200).json(
        new ApiResponce(200, "Subscribers retrieved successfully.", {
            subscribers,
            totalSubscribers: subscribers.length,
        })
    );
});


// Controller to get channels the user has subscribed to
 const getSubscribedChannels = asyncHandler(async (req, res) => {
    const subscriberId = req.user._id; // Authenticated user's ID

    // Aggregation pipeline to fetch subscribed channels
    const pipeline = [
        { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
        {
            $lookup: {
                from: "users", // Reference users collection
                localField: "channel", // Subscription's channel field
                foreignField: "_id", // User's ID
                as: "channelDetails",
            },
        },
        { $unwind: "$channelDetails" },
        {
            $project: {
                _id: 0,
                channelId: "$channelDetails._id",
                channelName: "$channelDetails.name",
                channelEmail: "$channelDetails.email",
                subscribedAt: "$createdAt",
            },
        },
    ];

    const subscribedChannels = await Subscription.aggregate(pipeline);

    res.status(200).json(
        new ApiResponce(200, "Subscribed channels retrieved successfully.", {
            subscribedChannels,
            totalChannels: subscribedChannels.length,
        })
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}