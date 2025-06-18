// 📁 controllers/audioController.ts

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import { Audio } from './audio.model';
import sendResponse from '../../utils/sendResponse';

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

export const uploadAudio = catchAsync(async (req, res) => {
  const { title, subject, language, description, tags, author, about,chapter,category } = req.body;

const files = req.files as { [fieldname: string]: Express.Multer.File[] };

if (!files || !files['audio'] || !files['coverImage']) {
  throw new AppError( 400, 'Audio and cover image are required.');
}

  const audioFile = files['audio'][0] as any;
  const coverImage = files['coverImage'][0];
  const originalPath = audioFile.path;
  const wavPath = originalPath.replace(path.extname(originalPath), '.wav');
  const encryptedPath = wavPath.replace('.wav', '.enc');

  await new Promise((resolve, reject) => {
    ffmpeg(originalPath)
      .toFormat('wav')
      .on('error', reject)
      .on('end', resolve)
      .save(wavPath);
  });

  await encryptFile(wavPath, encryptedPath);
  fs.unlinkSync(originalPath);
  fs.unlinkSync(wavPath);

  const audio = await Audio.create({
    title,
    subject,
    language,
    filePath: encryptedPath,
    coverImage: coverImage.path,
    description,
    tags,
    author,
    about,
    category,
    chapter
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

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY!), Buffer.from(process.env.IV!));
  const readStream = fs.createReadStream(audio.filePath);

  res.setHeader('Content-Type', 'audio/wav');
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Disposition', 'inline');

  readStream.pipe(decipher).pipe(res);
});

export const getAllAudios = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (req.query.language) filter.language = req.query.language;
  if (req.query.subject) filter.subject = req.query.subject;

  const [audios, total] = await Promise.all([
    Audio.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
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
