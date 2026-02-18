/**
 * Migration: Add Product Type and Tag System
 * 
 * Run with: node database/migrations/add-product-type-and-tags.js
 * 
 * This script:
 * 1. Creates the 'product_types' collection if it doesn't exist
 * 2. Adds tagStrings (normalized) to existing products from their tags array
 * 3. Sets productTypeId to null for existing products/categories that don't have one
 * 4. Creates indexes for fast search
 * 
 * Safe to re-run (idempotent).
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env');
    process.exit(1);
}

async function migrate() {
    const client = new MongoClient(DATABASE_URL);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(); // uses the database from the connection string

        // ──────────────────────────────────────────
        // 1. Ensure product_types collection exists
        // ──────────────────────────────────────────
        const collections = await db.listCollections({ name: 'product_types' }).toArray();
        if (collections.length === 0) {
            await db.createCollection('product_types');
            console.log('✅ Created product_types collection');
        } else {
            console.log('ℹ️  product_types collection already exists');
        }

        // ──────────────────────────────────────────
        // 2. Create indexes
        // ──────────────────────────────────────────
        const productTypes = db.collection('product_types');
        await productTypes.createIndex({ slug: 1 }, { unique: true });
        console.log('✅ Created index: product_types.slug (unique)');

        const categories = db.collection('product_categories');
        await categories.createIndex({ productTypeId: 1 });
        console.log('✅ Created index: product_categories.productTypeId');

        const products = db.collection('products');
        await products.createIndex({ productTypeId: 1, categoryId: 1 });
        console.log('✅ Created index: products.productTypeId + categoryId');

        await products.createIndex({ tagStrings: 1 });
        console.log('✅ Created index: products.tagStrings');

        // ──────────────────────────────────────────
        // 3. Backfill tagStrings from existing tags
        // ──────────────────────────────────────────
        const cursor = products.find({ tagStrings: { $exists: false } });
        let updatedCount = 0;

        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            const tags = doc.tags || [];
            const tagStrings = tags.map(t =>
                t.replace(/^#/, '').trim().toLowerCase()
            ).filter(Boolean);

            await products.updateOne(
                { _id: doc._id },
                { $set: { tagStrings } }
            );
            updatedCount++;
        }
        console.log(`✅ Backfilled tagStrings for ${updatedCount} products`);

        // Also set tagStrings to [] for products that have it as null
        const nullTagResult = await products.updateMany(
            { tagStrings: null },
            { $set: { tagStrings: [] } }
        );
        if (nullTagResult.modifiedCount > 0) {
            console.log(`✅ Set tagStrings=[] for ${nullTagResult.modifiedCount} products with null`);
        }

        // ──────────────────────────────────────────
        // 4. Set productTypeId to null where missing
        // ──────────────────────────────────────────
        const prodResult = await products.updateMany(
            { productTypeId: { $exists: false } },
            { $set: { productTypeId: null } }
        );
        console.log(`✅ Set productTypeId=null for ${prodResult.modifiedCount} products`);

        const catResult = await categories.updateMany(
            { productTypeId: { $exists: false } },
            { $set: { productTypeId: null } }
        );
        console.log(`✅ Set productTypeId=null for ${catResult.modifiedCount} categories`);

        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    } finally {
        await client.close();
    }
}

migrate();
