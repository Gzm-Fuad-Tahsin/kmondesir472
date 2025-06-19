import mongoose, { Schema, Types, model } from 'mongoose'
import { IPlaylist } from './playlist.interface'

const playlistSchema = new Schema<IPlaylist>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  audio: [{ type: Schema.Types.ObjectId, ref: "Audio" }],
},{
    timestamps: true,
})

export const Playlist = model<IPlaylist>(
  'Playlist',
  playlistSchema
)
