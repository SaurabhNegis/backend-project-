import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/ApiResponce.js"
import {asyncHandler} from "../utils/asyncHandler.js"
 

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
   
    //TODO: create playlist

    // Validate input
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required");
    }

    // Create a new playlist
    const playlist = new Playlist({
        name,
        description,
        owner: req.user._id, // Assuming `req.user` contains the authenticated user's data
    });

    // Save to database
    await playlist.save();

    // Respond with the created playlist
    res.status(201).json(new ApiResponce(201, "Playlist created successfully", playlist));

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
        // Validate userId
        if (!mongoose.isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid user ID");
        }
    
        // Fetch playlists for the user
        const playlists = await Playlist.find({ owner: userId }).populate("videos");
    
        // Respond with the playlists
        res.status(200).json(new ApiResponce(200, "User playlists retrieved successfully", playlists));
    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    // Validate playlistId
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Fetch the playlist by ID
    const playlist = await Playlist.findById(playlistId)
        .populate("videos") // Populate videos field
        .populate("owner", "name email"); // Populate owner field with selected fields

    // Handle playlist not found
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Respond with the playlist
    res.status(200).json(new ApiResponce(200, "Playlist retrieved successfully", playlist));
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
        // Validate playlistId and videoId
        if (!mongoose.isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }
        if (!mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }
    
        // Check if the playlist exists
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
    
        // Optional: Check if the video exists (assuming a Video model exists)
        const Video = mongoose.model("Video"); // Replace with your actual Video model
        const videoExists = await Video.exists({ _id: videoId });
        if (!videoExists) {
            throw new ApiError(404, "Video not found");
        }
    
        // Add video to the playlist if not already present
        if (!playlist.videos.includes(videoId)) {
            playlist.videos.push(videoId);
            await playlist.save();
        }
    
        // Respond with the updated playlist
        res.status(200).json(new ApiResponce(200, "Video added to playlist successfully", playlist));
    
})



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
        // Validate playlistId and videoId
        if (!mongoose.isValidObjectId(playlistId)) {
            throw new ApiError(400, "Invalid playlist ID");
        }
        if (!mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }
    
        // Check if the playlist exists
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }
    
        // Remove the video from the playlist
        const videoIndex = playlist.videos.indexOf(videoId);
        if (videoIndex === -1) {
            throw new ApiError(404, "Video not found in the playlist");
        }
    
        playlist.videos.splice(videoIndex, 1);
        await playlist.save();
    
        // Respond with the updated playlist
        res.status(200).json(new ApiResponce(200, "Video removed from playlist successfully", playlist));
    

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist


    // Validate playlistId
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Check if the playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Delete the playlist
    await playlist.remove();

    // Respond with success message
    res.status(200).json(new ApiResponce(200, "Playlist deleted successfully"));

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist


    // Validate playlistId
    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Check if the playlist exists
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Update the playlist fields
    if (name) playlist.name = name;
    if (description) playlist.description = description;

    // Save the updated playlist
    await playlist.save();

    // Respond with the updated playlist
    res.status(200).json(new ApiResponce(200, "Playlist updated successfully", playlist));

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
