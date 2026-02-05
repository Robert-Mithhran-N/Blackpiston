import { Router, Request, Response } from 'express';
import { upload } from '../config/cloudinary.js';

const router = Router();

// Upload single image
router.post('/image', (req: Request, res: Response, next) => {
    (req as any).uploadFolder = 'blackpiston/products';
    next();
}, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            message: 'Image uploaded successfully',
            url: (req.file as any).path,
            filename: (req.file as any).filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Upload multiple images (up to 5)
router.post('/images', (req: Request, res: Response, next) => {
    (req as any).uploadFolder = 'blackpiston/products';
    next();
}, upload.array('images', 5), async (req: Request, res: Response) => {
    try {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const files = req.files as Express.Multer.File[];
        const uploadedFiles = files.map(file => ({
            url: (file as any).path,
            filename: (file as any).filename
        }));

        res.json({
            message: 'Images uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

// Upload avatar
router.post('/avatar', (req: Request, res: Response, next) => {
    (req as any).uploadFolder = 'blackpiston/avatars';
    next();
}, upload.single('avatar'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            message: 'Avatar uploaded successfully',
            url: (req.file as any).path,
            filename: (req.file as any).filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Upload category image
router.post('/category', (req: Request, res: Response, next) => {
    (req as any).uploadFolder = 'blackpiston/categories';
    next();
}, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            message: 'Category image uploaded successfully',
            url: (req.file as any).path,
            filename: (req.file as any).filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Upload banner image
router.post('/banner', (req: Request, res: Response, next) => {
    (req as any).uploadFolder = 'blackpiston/banners';
    next();
}, upload.single('image'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        res.json({
            message: 'Banner image uploaded successfully',
            url: (req.file as any).path,
            filename: (req.file as any).filename
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

export default router;
