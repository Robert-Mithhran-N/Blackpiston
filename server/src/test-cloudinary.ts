import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testConnection() {
    try {
        const result = await cloudinary.api.ping();
        console.log('✅ Cloudinary connected successfully!');
        console.log('   Status:', result.status);

        const usage = await cloudinary.api.usage();
        console.log('   Plan:', usage.plan);
        console.log('   Storage used:', Math.round(usage.storage.usage / 1024 / 1024), 'MB');
        console.log('   Credits used:', usage.credits?.usage || 'N/A');
    } catch (error: any) {
        console.error('❌ Cloudinary connection failed!');
        console.error('   Error:', error.message || error);
    }
}

testConnection();
