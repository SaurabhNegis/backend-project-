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
      res.status(201)
      .json(new ApiResponce(201, "Tweet created successfully.",  tweet)
    );


})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params; // Extract userId from route params
    const { page = 1, limit = 10 } = req.query;

    // Validate userId
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID.");
    }
    
    // Convert page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Build the aggregation pipeline
    const pipeline = [
        // Match tweets authored by the user
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },

        // Sort tweets by creation date (most recent first)
        { $sort: { createdAt: -1 } },

        // Paginate: Skip and limit
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },

        // Optionally: Populate author details (if needed)
        {
            $lookup: {
                from: "users", // Name of the user collection
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    // Select only specific fields from the user document
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            email: 1, // Add or remove fields as needed
                        },
                    },
                ],
            },
        },

        { $unwind: "$ownerDetails" }, // Flatten the authorDetails array
    ];

    // Execute the aggregation
    const tweets = await Tweet.aggregate(pipeline);

    // Count total tweets for pagination
    const totalTweets = await Tweet.countDocuments({ owner: userId });
    const totalPages = Math.ceil(totalTweets / limitNum);

    // Respond with the results
    res.status(200).json(
        new ApiResponce(200, "User tweets retrieved successfully.", {
            tweets,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalTweets,
                limit: limitNum,
            },
        })
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params; // Extract the tweet ID from the route params
    const { content } = req.body;  // Extract the new content from the request body

    // Validate the tweet ID
    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID.");
    }

    // Ensure content is provided
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content cannot be empty.");
    }

    // Update the tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { content },
        { new: true, runValidators: true } // Return the updated document and validate the new content
    );

    // Check if the tweet exists
    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found.");
    }

    // Respond with the updated tweet
    res.status(200)
    .json(new ApiResponce(200, updatedTweet , "Updated tweet successfully."))

});


const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params; 
        // Validate the tweet ID
        if (!mongoose.isValidObjectId(tweetId)) {
            throw new ApiError(400, "Invalid tweet ID.");
        }
    
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

            // Check if the tweet exists
    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found.");
    }

    res.status(200)
    .json(new ApiResponce(200, deletedTweet, "Deleted tweet successfully."))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
