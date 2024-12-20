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
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
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
