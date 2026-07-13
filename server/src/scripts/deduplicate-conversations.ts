import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Loading all AI Conversations...');
    const conversations = await prisma.aiConversation.findMany({
        orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Found ${conversations.length} total records.`);

    const seenSessions = new Set<string>();
    const toDeleteIds: string[] = [];

    for (const conv of conversations) {
        if (seenSessions.has(conv.sessionId)) {
            toDeleteIds.push(conv.id);
        } else {
            seenSessions.add(conv.sessionId);
        }
    }

    console.log(`🗑️ Found ${toDeleteIds.length} duplicate records to delete.`);

    if (toDeleteIds.length > 0) {
        // Delete duplicates in batches
        const batchSize = 100;
        for (let i = 0; i < toDeleteIds.length; i += batchSize) {
            const batch = toDeleteIds.slice(i, i + batchSize);
            await prisma.aiConversation.deleteMany({
                where: {
                    id: { in: batch }
                }
            });
            console.log(`✅ Deleted batch ${i / batchSize + 1} (${batch.length} records)`);
        }
    }

    console.log('🎉 Deduplication complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error during deduplication:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
