import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import { CloudinaryApiKey, CloudinaryApiSecret, CloudinaryCloudName } from '../constants/index';

// Configure once at startup
cloudinary.config({
  cloud_name: CloudinaryCloudName,
  api_key: CloudinaryApiKey,
  api_secret: CloudinaryApiSecret,
});

/**
 * Upload file to Cloudinary
 */
export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    const response: UploadApiResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    // Remove local file after successful upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error: unknown) {
    console.error('Cloudinary upload error:', error);

    // Remove local file if upload fails
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteOnCloudinary = async (
  publicId: string,
  mediaType: 'image' | 'video' | 'raw' = 'image'
): Promise<boolean> => {
  try {
    if (!publicId) return false;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: mediaType,
    });

    return result.result === 'ok';
  } catch (error: unknown) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

export const uploadMultipleToCloudinary = async (files: Express.Multer.File[]) => {
  if (!files || files.length === 0) return [];

  const uploadedPhotos = await Promise.all(
    files.map(async (file) => {
      const result = await uploadOnCloudinary(file.path);

      // Safely delete temp file (may already be deleted by uploadOnCloudinary)
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url || result.url,
        uploadedAt: new Date(),
      };
    })
  );

  return uploadedPhotos;
};
