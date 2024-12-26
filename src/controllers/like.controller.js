import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id; // Assuming req.user is populated by the `verifyJWT` middleware.

    // Validate the videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check if the like already exists
    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // If a like exists, remove it (unlike)
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponce(200, {}, "Like removed successfully")
        );
    } else {
        // If no like exists, add a new like
        const newLike = await Like.create({
            video: videoId,
            likedBy: userId,
        });

        return res.status(201).json(
            new ApiResponce(201, { like: newLike }, "Video liked successfully")
        );
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id; // Assuming req.user is populated by the `verifyJWT` middleware.

    // Validate the commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Check if the like already exists
    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        // If a like exists, remove it (unlike)
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponce(200, {}, "Like removed successfully")
        );
    } else {
        // If no like exists, add a new like
        const newLike = await Like.create({
            comment: commentId,
            likedBy: userId,
        });

        return res.status(201).json(
            new ApiResponce(201, { like: newLike }, "Comment liked successfully")
        );
    }
});



const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id; // Assuming req.user is populated by the `verifyJWT` middleware.

    // Validate the tweetId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check if the like already exists
    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        // If a like exists, remove it (unlike)
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponce(200, {}, "Like removed successfully")
        );
    } else {
        // If no like exists, add a new like
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: userId,
        });

        return res.status(201).json(
            new ApiResponce(201, { like: newLike }, "Tweet liked successfully")
        );
    }
});


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Authenticated user's ID

    // Aggregation pipeline
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: mongoose.Types.ObjectId(userId), // Match likes by the user
                video: { $exists: true }, // Ensure it's related to videos
            },
        },
        {
            $lookup: {
                from: "videos", // The collection name for videos
                localField: "video", // Field in 'Like' schema
                foreignField: "_id", // Field in 'Video' schema
                as: "videoDetails", // Name of the new array field
            },
        },
        {
            $unwind: "$videoDetails", // Convert array of video details to object
        },
        {
            $project: {
                _id: 1, // Keep the like ID
                likedBy: 1, // Include likedBy field
                createdAt: 1, // Include the timestamp
                "videoDetails._id": 1,
                "videoDetails.title": 1,
                "videoDetails.url": 1,
                "videoDetails.description": 1,
                "videoDetails.createdAt": 1,
            },
        },
    ]);

    // Handle no results
    if (!likedVideos.length) {
        return res.status(200).json(
            new ApiResponce(200, { likedVideos: [] }, "No liked videos found")
        );
    }

    // Return the liked videos
    return res.status(200).json(
        new ApiResponce(200, { likedVideos }, "Liked videos fetched successfully")
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}