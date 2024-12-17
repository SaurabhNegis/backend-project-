import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import { ApiResponce } from "../utils/ApiResponce.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { UploadOnCloudnary } from "../utils/cloudnary.js";


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


const publishAVideo = asyncHandler(async (req, res) => {

    // TODO: get video, upload to cloudinary, create video
    // check for video file in req.files
    // Ensure required fields are provided
    // Step 1: Upload the video to Cloudinary
    // Step 2: Create and save video details in the database
    // Step 3: Respond with success
  

    const { title, description} = req.body
    // if (!title || !description) {
    //     throw new ApiError(400, "Title and description are required");
    // }
    if (
        [ title, description ].some((field) => 
           field?.trim() === "")
  
     ) {
          throw new ApiError(400, "Title and description are required")
     }
    // Access files
     const videoFile = req.files?.videoFile?.[0]; // Video file
     const thumbnail = req.files?.thumbnail?.[0]; // Thumbnail file
    
    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "Both videoFile and thumbnail are required");
    }
    
 
    try {
        // Step 1: Upload video to Cloudinary
    const videoUploadResult = await UploadOnCloudnary(videoFile.path, "video");
    const thumbnailUploadResult = await UploadOnCloudnary(thumbnail.path, "image");

    if (!videoUploadResult || !videoUploadResult.secure_url) {
            throw new ApiError(500, "Failed to upload video to Cloudinary");
        }

      // Step 3: Create a new video entry in the database
        const newVideo = await Video.create({
            title,
            description,
            videoFile: videoUploadResult.secure_url,
            thumbnail: thumbnailUploadResult.secure_url,
            duration: req.body.duration || 0, // Optionally, include video duration from the client
            owner: req.user.id, // Assuming `req.user` is populated by authentication middleware
        });

        
        const createdNewvideo =   await Video.findById(newVideo._id)
        
          if(!createdNewvideo){
            throw new ApiError(500, "something went wrong while publishing  the video!")
            
          }


        // Step 4: Respond with success
        res.status(201).json(new ApiResponce(201, "Video published successfully", createdNewvideo));
    } catch (error) {
        throw new ApiError(500, error.message);
    }

})


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
