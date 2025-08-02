import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.error('Invalid file path or file does not exist:', localFilePath);
      return null;
    }

    const fileExt = path.extname(localFilePath).toLowerCase();
    const resourceType = fileExt === '.jpg' || fileExt === '.png' || fileExt === '.jpeg'
      ? 'image'
      : fileExt === '.mp4' || fileExt === '.mov'
      ? 'video'
      : 'raw';

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder: 'uploads', // Optional
    });

    // console.log('Upload successful:', response);

    // Optionally delete local file after upload
    // fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error('Upload failed:', error);

    // // Delete local file if it exists
    // if (fs.existsSync(localFilePath)) {
    //   fs.unlinkSync(localFilePath);
    // }

    return null;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
  }
}
