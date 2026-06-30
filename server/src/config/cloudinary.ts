import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Resolve .env path relative to this file (not CWD)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Validate required env keys on startup
const requiredKeys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingKeys = requiredKeys.filter(k => !process.env[k]);
if (missingKeys.length > 0) {
    console.warn(`⚠️  Cloudinary: Missing env keys: ${missingKeys.join(', ')}. Image uploads will fail.`);
}

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder based on file type or route
        const folder = (req as any).uploadFolder || 'blackpiston/general';

        return {
            folder: folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        };
    }
});

// Multer upload middleware
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
        }
    }
});

// Helper function to upload image to Cloudinary (from file path or buffer)
export async function uploadToCloudinary(
    filePath: string,
    folder: string = 'blackpiston/general'
): Promise<{ url: string; public_id: string; width: number; height: number }> {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folder,
            transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto:good' }
            ]
        });

        return {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height
        };
    } catch (error: any) {
        console.error('❌ Cloudinary upload failed:', error?.message || error);
        throw new Error(`Cloudinary upload failed: ${error?.message || 'Unknown error'}`);
    }
}

// Helper function to delete image from Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️  Cloudinary delete [${publicId}]:`, result.result);
        return result.result === 'ok';
    } catch (error) {
        console.error('❌ Failed to delete from Cloudinary:', error);
        return false;
    }
}

// Get optimized URL for an image
export function getOptimizedUrl(
    publicId: string,
    options: {
        width?: number;
        height?: number;
        crop?: string;
        quality?: string;
    } = {}
): string {
    const { width = 800, height = 600, crop = 'fill', quality = 'auto:good' } = options;

    return cloudinary.url(publicId, {
        width,
        height,
        crop,
        quality,
        secure: true
    });
}

export { cloudinary };
