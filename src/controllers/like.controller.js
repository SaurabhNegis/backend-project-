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
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}