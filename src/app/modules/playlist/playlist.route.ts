import express from "express";
import { protect } from "../../../middlewares/auth";
import { addToPlaylist, deleteFromPlaylist, getPlaylist, getPlaylistAudioId } from "./playlist.controller";

const router = express.Router();

router.post("/add", protect, addToPlaylist);

router.get("/", protect, getPlaylist);
router.get("/ids", protect, getPlaylistAudioId);

router.delete("/remove", protect, deleteFromPlaylist);

export default router;
