import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { upload, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

// ============================================================
// Auth Middleware — verify JWT for upload protection
// ============================================================
function authenticateUpload(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required for uploads' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
            userId: string;
            role: string;
        };

        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Helper to extract structured response from multer-cloudinary file
function formatUploadedFile(file: Express.Multer.File) {
    return {
        url: (file as any).path,
        public_id: (file as any).filename, // multer-storage-cloudinary sets filename = public_id
        filename: (file as any).filename,
    };
}

// Upload single image
router.post('/image', authenticateUpload, (req: Request, res: Response, next: NextFunction) => {
    (req as any).uploadFolder = 'blackpiston/products';
    next();
}, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploaded = formatUploadedFile(req.file);
        console.log(`📸 Image uploaded: ${uploaded.public_id}`);

        res.json({
            message: 'Image uploaded successfully',
            ...uploaded,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Upload multiple images (up to 5)
router.post('/images', authenticateUpload, (req: Request, res: Response, next: NextFunction) => {
    (req as any).uploadFolder = 'blackpiston/products';
    next();
}, upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = (req.files as Express.Multer.File[]).map(formatUploadedFile);
        console.log(`📸 ${files.length} images uploaded:`, files.map(f => f.public_id));

        res.json({
            message: 'Images uploaded successfully',
            files,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

// Upload avatar
router.post('/avatar', authenticateUpload, (req: Request, res: Response, next: NextFunction) => {
    (req as any).uploadFolder = 'blackpiston/avatars';
    next();
}, upload.single('avatar'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploaded = formatUploadedFile(req.file);
        res.json({
            message: 'Avatar uploaded successfully',
            ...uploaded,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Upload category image
router.post('/category', authenticateUpload, (req: Request, res: Response, next: NextFunction) => {
    (req as any).uploadFolder = 'blackpiston/categories';
    next();
}, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploaded = formatUploadedFile(req.file);
        res.json({
            message: 'Category image uploaded successfully',
            ...uploaded,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Upload banner image
router.post('/banner', authenticateUpload, (req: Request, res: Response, next: NextFunction) => {
    (req as any).uploadFolder = 'blackpiston/banners';
    next();
}, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const uploaded = formatUploadedFile(req.file);
        res.json({
            message: 'Banner image uploaded successfully',
            ...uploaded,
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Delete an image from Cloudinary by public_id
router.delete('/image/:publicId(*)', authenticateUpload, async (req: Request, res: Response) => {
    try {
        const publicId = req.params.publicId;
        if (!publicId) {
            return res.status(400).json({ error: 'public_id is required' });
        }

        const success = await deleteFromCloudinary(publicId);
        if (success) {
            res.json({ message: 'Image deleted successfully', public_id: publicId });
        } else {
            res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
        }
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

export default router;
