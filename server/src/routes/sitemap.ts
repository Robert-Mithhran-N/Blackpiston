import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';

const router = Router();

// Cache sitemap in-memory for 1 hour to optimize performance under scale
let cachedSitemap: string | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getBaseUrl(req: Request): string {
    const rawFrontend = process.env.FRONTEND_URL;
    if (rawFrontend) {
        // Split comma-separated URLs and get the first one
        const urls = rawFrontend.split(',').map(u => u.trim()).filter(Boolean);
        if (urls.length > 0) {
            const prodUrl = urls.find(u => !u.includes('localhost') && !u.includes('127.0.0.1'));
            if (prodUrl) return prodUrl;
            return urls[0];
        }
    }
    // Fallback to absolute production domain or host header
    const host = req.get('host') || 'localhost:3001';
    const protocol = req.secure ? 'https' : 'http';
    return `${protocol}://${host}`;
}

router.get('/', async (req: Request, res: Response) => {
    try {
        const now = Date.now();
        if (cachedSitemap && (now - cacheTimestamp < CACHE_DURATION)) {
            res.header('Content-Type', 'application/xml');
            return res.send(cachedSitemap);
        }

        const baseUrl = getBaseUrl(req);

        // Fetch dynamic items from MongoDB via Prisma
        const [products, blogs, services] = await Promise.all([
            prisma.product.findMany({
                where: { isActive: true },
                select: { slug: true, updatedAt: true }
            }),
            prisma.blog.findMany({
                where: { isPublished: true },
                select: { slug: true, updatedAt: true }
            }),
            prisma.service.findMany({
                where: { 
                    isActive: true,
                    visible: true,
                    status: { not: 'ARCHIVED' }
                },
                select: { slug: true, updatedAt: true }
            })
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        const addUrl = (path: string, lastmod?: Date, changefreq = 'weekly', priority = '0.5') => {
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}${path}</loc>\n`;
            if (lastmod) {
                xml += `    <lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>\n`;
            } else {
                xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
            }
            xml += `    <changefreq>${changefreq}</changefreq>\n`;
            xml += `    <priority>${priority}</priority>\n`;
            xml += '  </url>\n';
        };

        // 1. Static Pages
        addUrl('/', new Date(), 'daily', '1.0');
        addUrl('/shop', new Date(), 'daily', '0.9');
        addUrl('/garage', new Date(), 'weekly', '0.8');
        addUrl('/about', new Date(), 'monthly', '0.7');
        addUrl('/blog', new Date(), 'daily', '0.7');
        addUrl('/contact', new Date(), 'monthly', '0.8');
        addUrl('/faq', new Date(), 'weekly', '0.6');
        addUrl('/privacy', new Date(), 'monthly', '0.3');
        addUrl('/terms', new Date(), 'monthly', '0.3');
        addUrl('/refund-policy', new Date(), 'monthly', '0.3');
        addUrl('/shipping', new Date(), 'monthly', '0.3');
        addUrl('/warranty', new Date(), 'monthly', '0.3');

        // 2. Dynamic Products
        products.forEach(p => {
            if (p.slug) {
                addUrl(`/product/${p.slug}`, p.updatedAt, 'daily', '0.8');
            }
        });

        // 3. Dynamic Blogs
        blogs.forEach(b => {
            if (b.slug) {
                addUrl(`/blog/${b.slug}`, b.updatedAt, 'weekly', '0.7');
            }
        });

        // 4. Dynamic Services
        services.forEach(s => {
            if (s.slug) {
                addUrl(`/garage`, s.updatedAt, 'weekly', '0.6');
            }
        });

        xml += '</urlset>\n';

        cachedSitemap = xml;
        cacheTimestamp = now;

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Failed to generate sitemap');
    }
});

export default router;
