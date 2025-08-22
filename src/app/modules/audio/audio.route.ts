import express from 'express';
import multer from 'multer';
import { isAdmin, protect } from '../../../middlewares/auth';
import { deleteAudio, getAllAudios, streamAudio, updateAudio, uploadAudio } from './audio.controller';

const router = express.Router();


const upload = multer({ storage: multer.memoryStorage() });

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
router.patch('/:audioId/update', 
  upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]), updateAudio);
router.get('/all-audio', getAllAudios);
router.delete('/:audioId', deleteAudio);

export default router;
