import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) throw new ApiError(400, "userId required");

    const getUserPlaylist = await Playlist.findById(playlistId);

    if (!getUserPlaylist) throw new ApiError(500, "playlists not found");

    res
        .status(200)
        .json(new ApiResponse(200, getUserPlaylist, "playlists found successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the user is the owner of the playlist
    if (playlist.owner !== req.user) {
        throw new ApiError(403, "You are not allowed to remove videos from this playlist");
    }

    // Remove the video from the playlist's videos array
    playlist.videos = playlist.videos.filter(vid => vid !== videoId);

    // Save the updated playlist
    try {
        await playlist.save();
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "something went wrong while saving video")
    }

    res.status(200).json(new ApiResponse(200, playlist, "Video removed from playlist"));


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    const playlist = await Playlist.findById(playlistId);

    // Check if the playlist exists
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Check if the user is the owner of the playlist
    if (playlist.owner !== req.user) {
        throw new ApiError(403, "You are not allowed to remove videos from this playlist");
    }

    await playlist.remove();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist deleted successfully"
        )
    );
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