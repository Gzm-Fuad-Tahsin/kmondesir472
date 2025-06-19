import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import { Playlist } from "./playlist.model";
import sendResponse from "../../utils/sendResponse";

export const addToPlaylist = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { audioId } = req.body;

  let playlist = await Playlist.findOne({ user: userId });

  if (!playlist) {
    // Create playlist if not exists
    playlist = await Playlist.create({ user: userId, audio: [audioId] });
  } else {
    // Prevent duplicate audio
    if (playlist.audio.includes(audioId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Audio already in playlist");
    }
    playlist.audio.push(audioId);
    await playlist.save();
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audio added to playlist",
    data: playlist,
  });
});

export const getPlaylist = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const playlist = await Playlist.findOne({ user: userId }).populate("audio");

  if (!playlist) {
    throw new AppError(httpStatus.NOT_FOUND, "No playlist found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Playlist retrieved successfully",
    data: playlist,
  });
});

export const deleteFromPlaylist = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { audioId } = req.body;

  const playlist = await Playlist.findOne({ user: userId });

  if (!playlist) {
    throw new AppError(httpStatus.NOT_FOUND, "No playlist found");
  }

  const index = playlist.audio.indexOf(audioId);
  if (index === -1) {
    throw new AppError(httpStatus.BAD_REQUEST, "Audio not found in playlist");
  }

  playlist.audio.splice(index, 1);
  await playlist.save();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Audio removed from playlist",
    data: playlist,
  });
});
