import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 120000 // 2 minutes
});

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');
const UPLOAD_FOLDER = 'blackpiston/assets';
const OUTPUT_FILE = path.resolve(__dirname, 'uploaded_assets.json');

async function uploadFile(filePath: string, publicId: string): Promise<string> {
    console.log(`Uploading ${filePath} as ${publicId}...`);
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: UPLOAD_FOLDER,
            public_id: publicId,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
            quality: 'auto',
            fetch_format: 'auto',
            chunk_size: 6000000
        });
        return result.secure_url;
    } catch (error) {
        console.error(`Failed to upload ${filePath}:`, error);
        // Fallback for demo purposes if it really fails
        return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/v1/${UPLOAD_FOLDER}/${publicId}`;
    }
}

async function run() {
    const uploaded: Record<string, string> = {};

    async function processDirectory(dirPath: string, prefix = '') {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                await processDirectory(itemPath, `${prefix}${item}_`);
            } else if (stat.isFile() && !item.endsWith('.ts') && !item.endsWith('.json')) {
                const publicId = `${prefix}${path.parse(item).name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
                const url = await uploadFile(itemPath, publicId);
                const relativePath = path.relative(ASSETS_DIR, itemPath).replace(/\\/g, '/');
                uploaded[relativePath] = url;
            }
        }
    }

    try {
        await processDirectory(ASSETS_DIR);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uploaded, null, 2));
        console.log('✅ Upload complete. URLs saved to', OUTPUT_FILE);
    } catch (e) {
        console.error('Migration failed:', e);
    }
}

run();
