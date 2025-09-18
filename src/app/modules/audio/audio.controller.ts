// 📁 controllers/audioController.ts

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import streamifier from 'streamifier';
import path from 'path';
import crypto from 'crypto';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import { Audio } from './audio.model';
import sendResponse from '../../utils/sendResponse';


import { v2 as cloudinary } from 'cloudinary'
import { uploadToCloudinary } from '../../utils/cloudinary';


const encryptFile = (inputPath: string, outputPath: string) => {
  const key = process.env.ENCRYPTION_KEY;
  const iv = process.env.IV;

  if (!key || !iv) {
    throw new Error('ENCRYPTION_KEY or IV is not defined in .env');
  }

  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key),
    Buffer.from(iv)
  );
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);
  return new Promise((resolve, reject) => {
    input.pipe(cipher).pipe(output)
      .on('finish', resolve)
      .on('error', reject);
  });
};

// CLOUDINARY_CLOUD_NAME=ddtuyxcsl
// CLOUDINARY_API_KEY=155594432527689
// CLOUDINARY_API_SECRET=fw86uLN2JW_S9tYxb69R48Fym2k
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


export const uploadAudio = catchAsync(async (req, res) => {
  const { title, subject, language, description, tags, author, about,chapter,category } = req.body;

const files = req.files as { [fieldname: string]: Express.Multer.File[] };

if (!files || !files['audio'] || !files['coverImage']) {
  throw new AppError( 400, 'Audio and cover image are required.');
}

  // const audioFile = files['audio'][0] as any;
  // const coverImage = files['coverImage'][0];
  // const originalPath = audioFile.path;
  // const wavPath = originalPath.replace(path.extname(originalPath), '.wav');
  // const encryptedPath = wavPath.replace('.wav', '.enc');

  // await new Promise((resolve, reject) => {
  //   ffmpeg(originalPath)
  //     .toFormat('wav')
  //     .on('error', reject)
  //     .on('end', resolve)
  //     .save(wavPath);
  // });

  // // await encryptFile(wavPath, encryptedPath);
  //  // Upload WAV file to Cloudinary (as raw file)
  // const audioUploadResult = await cloudinary.uploader.upload(wavPath, {
  //   resource_type: 'raw',
  //   folder: 'audio_files',
  // });

  // // Upload Cover Image to Cloudinary (as image)
  // const imageUploadResult = await cloudinary.uploader.upload(coverImage.path, {
  //   folder: 'audio_covers',
  // });

  const audioFile = files['audio'][0];
  const coverImage = files['coverImage'][0];

  // Step 1: Convert MP3 buffer to WAV buffer using ffmpeg
  // const wavBuffer = await new Promise<Buffer>((resolve, reject) => {
  //   const chunks: Buffer[] = [];
  //   const command = ffmpeg(streamifier.createReadStream(audioFile.buffer))
  //     .toFormat('wav')
  //     .on('error', reject)
  //     .on('end', () => {
  //       const finalBuffer = Buffer.concat(chunks);
  //       resolve(finalBuffer);
  //     })
  //     .pipe();

  //   command.on('data', (chunk) => chunks.push(chunk));
  // });
  const wavBuffer = await new Promise<Buffer>((resolve, reject) => {
  const chunks: Buffer[] = [];
  const command = ffmpeg(streamifier.createReadStream(audioFile.buffer))
    .audioCodec('aac')
    .audioBitrate('96k')
    .format('m4a')
    .on('error', reject)
    .on('end', () => {
      resolve(Buffer.concat(chunks));
    })
    .pipe();

  command.on('data', (chunk) => chunks.push(chunk));
});

  // Step 2: Upload WAV buffer to Cloudinary
  const audioUploadResult = await uploadToCloudinary(wavBuffer, audioFile.originalname, 'audio_files');
  if (!audioUploadResult) throw new AppError(500, 'Failed to upload audio to Cloudinary');

  // Step 3: Upload Cover Image buffer to Cloudinary
  const imageUploadResult = await uploadToCloudinary(coverImage.buffer, coverImage.originalname, 'audio_covers');
  if (!imageUploadResult) throw new AppError(500, 'Failed to upload cover image to Cloudinary');

  // Step 4: Save to MongoDB

  const audio = await Audio.create({
    title,
    subject,
    language,
    filePath: audioUploadResult?.secure_url,
    coverImage: imageUploadResult?.secure_url,
    description,
    tags,
    author,
    about,
    category,
    chapter: JSON.parse(chapter || '[]'),
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Audio uploaded and encrypted successfully.',
    data: audio,
  });
});

export const streamAudio = catchAsync(async (req, res) => {
  const { audioId } = req.params;
  const audio = await Audio.findById(audioId);
  if (!audio) throw new AppError( 404,'Audio not found');

  audio.listeners += 1;
  await audio.save();
  sendResponse(res,{
    statusCode: 200,
    success: true,
    message: 'Audio streamed successfully.',
    data: audio,
  })
});

export const getAllAudios = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};
 if (req.query.q) {
  const search = new RegExp(req.query.q as any, "i"); // case-insensitive regex
  filter.$or = [
    { title: search }
  ];
}
  if (req.query.subject) filter.subject = req.query.subject;
  if( req.query.category) filter.category = req.query.category

  const [audios, total] = await Promise.all([
    Audio.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).populate("category"),
    Audio.countDocuments(filter),
  ]);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Audio list fetched successfully',
    data: {
      audios,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});


export const updateAudio = catchAsync(async (req, res) => {
  const { audioId } = req.params;
  const updateData = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    
  

  if(files['audio']){
    const audioFile = files['audio'][0];

  // Step 1: Convert MP3 buffer to WAV buffer using ffmpeg
  const wavBuffer = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const command = ffmpeg(streamifier.createReadStream(audioFile.buffer))
      .toFormat('wav')
      .on('error', reject)
      .on('end', () => {
        const finalBuffer = Buffer.concat(chunks);
        resolve(finalBuffer);
      })
      .pipe();

    command.on('data', (chunk) => chunks.push(chunk));
  });

  // Step 2: Upload WAV buffer to Cloudinary
  const audioUploadResult = await uploadToCloudinary(wavBuffer, audioFile.originalname, 'audio_files');
  if (!audioUploadResult) throw new AppError(500, 'Failed to upload audio to Cloudinary');
  updateData.filePath = audioUploadResult.secure_url
}

if(files['coverImage']){
  const coverImage = files['coverImage'][0];

  // Step 3: Upload Cover Image buffer to Cloudinary
  const imageUploadResult = await uploadToCloudinary(coverImage.buffer, coverImage.originalname, 'audio_covers');
  if (!imageUploadResult) throw new AppError(500, 'Failed to upload cover image to Cloudinary');
  updateData.coverImage = imageUploadResult.secure_url
}

if(updateData.chapter) {
  updateData.chapter = JSON.parse(updateData.chapter)
}
if(updateData.tags) {
  updateData.tags = JSON.parse(updateData.tags);
}

  const audio = await Audio.findByIdAndUpdate(audioId, updateData, { new: true });

  if (!audio) throw new AppError(404, 'Audio not found');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Audio updated successfully',
    data: audio,
  });
});


export const deleteAudio = catchAsync(async (req, res) => {
  const { audioId } = req.params;

  const audio = await Audio.findById(audioId);
  if (!audio) throw new AppError(404, 'Audio not found');

  // Delete audio and cover image from disk
  if (fs.existsSync(audio.filePath)) fs.unlinkSync(audio.filePath);
  if (fs.existsSync(audio.coverImage)) fs.unlinkSync(audio.coverImage);

  await audio.deleteOne();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Audio deleted successfully',
    data: ""
  });
});
