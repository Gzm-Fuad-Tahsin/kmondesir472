import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import { uploadToCloudinary } from "../../utils/cloudinary";
import sendResponse from "../../utils/sendResponse";
import { Category } from "./category.model";


// Create a new category
export const createCategory = catchAsync(async (req, res) => {
  const { name, description = '', about = '', slug } = req.body;

  if (!name) {
    throw new AppError(400, "Category name is required");
  }
      let image
    if (req.file) {

        const image1 = await uploadToCloudinary(req.file.path);
        image = image1?.secure_url;
    }

  const newCategory = await Category.create({
    name,
    description,
    about,
    image,
    slug,
  });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully",
    data: newCategory,
  });
});

// Get all categories
export const getAllCategories = catchAsync(async (req, res) => {
  const categories = await Category.find();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully",
    data: categories,
  });
});

// Get single category by ID
export const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(400, "Category ID is required");
  }

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category retrieved successfully",
    data: category,
  });
});

// Update a category
export const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, description, about, slug } = req.body;

  if (!id) {
    throw new AppError(400, "Category ID is required");
  }
  let data:any ={}
    if (req.file) {

        const image1 = await uploadToCloudinary(req.file.path);
        data.image  = image1?.secure_url;
    }
    if (name) { data.name = name }
    if (description) { data.description = description }
    if (about) { data.about = about }
    if (slug) { data.slug = slug }
  

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    data,
    { new: true, runValidators: true }
  );

  if (!updatedCategory) {
    throw new AppError(404, "Category not found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

// Delete a category
export const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new AppError(400, "Category ID is required");
  }

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    throw new AppError(404, "Category not found");
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully",
    data: deletedCategory,
  });
});
