import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { UploadApiResponse } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// export const uploadToCloudinary = async (
//   buffer: Buffer,
//   originalName: string,
//   folder = 'uploads'
// ): Promise<UploadApiResponse | null> => {
//   try {
//     if (!buffer || !originalName) {
//       console.error('Invalid buffer or original filename.');
//       return null;
//     }

//     const fileExt = originalName.split('.').pop()?.toLowerCase() || '';
//     const resourceType =
//       ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)
//         ? 'image'
//         : ['mp4', 'mov', 'webm'].includes(fileExt)
//         ? 'video'
//         : 'raw';

//     const base64Data = buffer.toString('base64');
//     const dataUri = `data:application/octet-stream;base64,${base64Data}`;

//     const result = await cloudinary.uploader.upload(dataUri, {
//       resource_type: resourceType,
//       folder,
//     });

//     return result;
//   } catch (error) {
//     console.error('Cloudinary buffer upload failed:', error);
//     return null;
//   }
// };


export const uploadToCloudinary = async (
  buffer: Buffer,
  originalName: string,
  folder = "uploads"
): Promise<UploadApiResponse | null> => {
  try {
    if (!buffer || !originalName) {
      console.error("Invalid buffer or original filename.");
      return null;
    }

    const fileExt = originalName.split(".").pop()?.toLowerCase() || "";
    const resourceType =
      ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt)
        ? "image"
        : ["mp4", "mov", "webm"].includes(fileExt)
        ? "video"
        : "raw";

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder,
          // public_id: originalName.split(".")[0], // optional: keep file name
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload_stream failed:", error);
            reject(error);
          } else {
            resolve(result as UploadApiResponse);
          }
        }
      );

      // Pipe the buffer into the upload stream
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary buffer upload failed:", error);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};