import express from 'express'
import multer from 'multer'
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from './category.controller';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router()
router.post('/create-category',upload.single("imageLink"), createCategory);
router.get("/all-category", getAllCategories);
router.get("/get-category/:id", getCategoryById)
router.patch('/update-category/:id',upload.single("imageLink"), updateCategory);
router.delete("/:id",deleteCategory)


export default router