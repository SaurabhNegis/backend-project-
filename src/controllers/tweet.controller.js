import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
        throw new ApiError(400,"Content is required for a tweet." )
    }
        // Ensure the user exists
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID.");
        }
    
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found.");
        }
    
        // Create the tweet
        const tweet = await Tweet.create({
            content: content.trim(),
            owner: userId,
        });
    
      // Respond with success
      res.status(201).json(
        new ApiResponce(201, "Tweet created successfully.", {
            tweet,
        })
    );


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
