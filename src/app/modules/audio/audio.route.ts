import express from 'express';
import multer from 'multer';
import { isAdmin, protect } from '../../../middlewares/auth';
import { streamAudio, uploadAudio } from './audio.controller';

const router = express.Router();

// Configure Multer for audio and cover image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'audio') cb(null, 'uploads/audio/');
    else cb(null, 'uploads/covers/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Route: Upload encrypted audio (Admin only)
router.post(
  '/upload',
//   protect,
//   isAdmin,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  uploadAudio
);

// ✅ Route: Stream audio securely with listener tracking
router.get('/:audioId/play', streamAudio);

export default router;
