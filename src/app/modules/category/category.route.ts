import express from 'express'
import multer from 'multer'
import { createCategory } from './category.controller';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()
router.put('/drivers',upload.single("avatar"), createCategory)