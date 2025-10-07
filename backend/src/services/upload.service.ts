import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadService {
  /**
   * Generate a signed upload URL for direct upload from the frontend
   * This is more secure than uploading through the backend
   */
  static async generateUploadSignature(folder: string = 'menu-items') {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    };
  }

  /**
   * Upload an image from a base64 string or URL
   * (Alternative method for server-side upload)
   */
  static async uploadImage(
    imageData: string,
    folder: string = 'menu-items'
  ): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(imageData, {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete an image from Cloudinary by URL
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract public ID from URL
      const publicId = this.extractPublicId(imageUrl);

      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      // Don't throw - deletion failure shouldn't block the operation
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  private static extractPublicId(url: string): string | null {
    try {
      const matches = url.match(/\/([^\/]+)\.\w+$/);
      return matches ? matches[1] : null;
    } catch (error) {
      return null;
    }
  }
}

export default UploadService;
