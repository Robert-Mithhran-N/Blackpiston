// ============================================================
// Seed script for AI Knowledge Base
// Populates initial FAQs, policies, and store info
// Run: npx tsx src/scripts/seed-ai-knowledge.ts
// ============================================================

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const prisma = new PrismaClient();

const FAQ_ENTRIES = [
    {
        category: 'FAQ' as const,
        question: 'Do you install the parts you sell?',
        answer: 'Yes! We can handle installations, tuning, and post-install checks at our garage. Share your bike details and parts list, and we\'ll schedule a convenient time for you.',
        tags: ['installation', 'service', 'garage'],
        priority: 10,
    },
    {
        category: 'FAQ' as const,
        question: 'How long does a service take?',
        answer: 'Simple installations can be completed same-day. Larger jobs depend on parts availability and scope. We always share timelines upfront before starting work.',
        tags: ['service', 'duration', 'timing'],
        priority: 9,
    },
    {
        category: 'FAQ' as const,
        question: 'Can you help me choose the right parts?',
        answer: 'Absolutely! We verify compatibility before ordering, so you avoid returns and downtime. Just tell us your bike model and what you\'re looking for.',
        tags: ['compatibility', 'recommendation', 'parts'],
        priority: 9,
    },
    {
        category: 'FAQ' as const,
        question: 'Do you ship parts?',
        answer: 'Yes, we ship across India with tracked shipping. If you prefer pickup or installation at our garage, we can arrange that too.',
        tags: ['shipping', 'delivery', 'pickup'],
        priority: 8,
    },
    {
        category: 'FAQ' as const,
        question: 'What payment methods do you accept?',
        answer: 'We accept online payments (UPI, credit/debit cards, net banking, wallets) and Cash on Delivery (COD) for eligible orders.',
        tags: ['payment', 'upi', 'cod', 'card'],
        priority: 8,
    },
    {
        category: 'FAQ' as const,
        question: 'Do you offer warranty on products?',
        answer: 'Warranty depends on the product and manufacturer. Each product page lists warranty details. We pass through all manufacturer warranties and also assist with warranty claims.',
        tags: ['warranty', 'guarantee', 'returns'],
        priority: 7,
    },
    {
        category: 'FAQ' as const,
        question: 'How do I track my order?',
        answer: 'Once your order is shipped, you\'ll receive tracking details via email and SMS. You can also check your order status in your profile under "Orders".',
        tags: ['tracking', 'order', 'delivery'],
        priority: 7,
    },
];

const POLICY_ENTRIES = [
    {
        category: 'POLICY' as const,
        question: 'What is your return policy?',
        answer: 'We accept returns within 7 days of delivery for unused, undamaged products in original packaging. Helmets with the visor sticker removed or products showing signs of use are not eligible for return. To initiate a return, go to your order in Profile > Orders.',
        tags: ['return', 'refund', 'exchange'],
        priority: 10,
    },
    {
        category: 'POLICY' as const,
        question: 'What is your refund policy?',
        answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund is credited to the original payment method. For COD orders, refund is sent via bank transfer.',
        tags: ['refund', 'money back', 'payment'],
        priority: 10,
    },
    {
        category: 'POLICY' as const,
        question: 'What is your shipping policy?',
        answer: 'We offer free shipping on orders above ₹999. Standard delivery takes 3-7 business days depending on your location. Express shipping is available for select pincodes. All orders are shipped with tracking.',
        tags: ['shipping', 'delivery', 'free shipping', 'express'],
        priority: 10,
    },
    {
        category: 'POLICY' as const,
        question: 'What is your privacy policy?',
        answer: 'We collect only essential personal information needed to process your orders and provide customer support. Your data is never sold to third parties. Payment information is securely processed through Razorpay and never stored on our servers.',
        tags: ['privacy', 'data', 'personal information'],
        priority: 8,
    },
    {
        category: 'POLICY' as const,
        question: 'What are your terms and conditions?',
        answer: 'By using BlackPiston Garage, you agree to our terms of service. Products are subject to availability. Prices may change without notice. We reserve the right to cancel orders in case of pricing errors or stock issues, with a full refund.',
        tags: ['terms', 'conditions', 'tos'],
        priority: 7,
    },
    {
        category: 'POLICY' as const,
        question: 'How do I cancel my order?',
        answer: 'You can cancel your order before it is shipped. Go to Profile > Orders and click "Cancel Order". If the order has already been shipped, you\'ll need to initiate a return after delivery.',
        tags: ['cancel', 'order', 'cancellation'],
        priority: 9,
    },
];

const STORE_INFO_ENTRIES = [
    {
        category: 'STORE_INFO' as const,
        question: 'What are your business hours?',
        answer: 'Our garage and store are open Monday to Saturday, 10:00 AM to 7:00 PM. We are closed on Sundays and public holidays.',
        tags: ['hours', 'timing', 'open', 'close'],
        priority: 10,
    },
    {
        category: 'STORE_INFO' as const,
        question: 'How can I contact BlackPiston Garage?',
        answer: 'You can reach us through: WhatsApp (fastest response), Phone, Email, or visit our store in person. Check the Contact page for all details.',
        tags: ['contact', 'phone', 'email', 'whatsapp'],
        priority: 10,
    },
    {
        category: 'STORE_INFO' as const,
        question: 'Where is BlackPiston Garage located?',
        answer: 'Visit our Contact page for our complete address and directions. You can also find us on Google Maps.',
        tags: ['location', 'address', 'directions', 'map'],
        priority: 9,
    },
    {
        category: 'STORE_INFO' as const,
        question: 'What is BlackPiston Garage?',
        answer: 'BlackPiston Garage is a one-stop destination for motorcycle accessories, riding gear, and professional garage services. We offer premium helmets, exhausts, engine oils, gloves, jackets, LED lights, and more — along with expert installation and maintenance services.',
        tags: ['about', 'who', 'what', 'blackpiston'],
        priority: 10,
    },
];

async function seedAiKnowledge() {
    console.log('🧠 Seeding AI Knowledge Base...\n');

    const allEntries = [...FAQ_ENTRIES, ...POLICY_ENTRIES, ...STORE_INFO_ENTRIES];

    let created = 0;
    let skipped = 0;

    for (const entry of allEntries) {
        // Check if a similar entry already exists
        const existing = await prisma.aiKnowledgeBase.findFirst({
            where: {
                question: entry.question,
                category: entry.category,
            },
        });

        if (existing) {
            skipped++;
            console.log(`  ⏭️  Skipped (exists): ${entry.question.substring(0, 50)}...`);
            continue;
        }

        await prisma.aiKnowledgeBase.create({
            data: {
                ...entry,
                isActive: true,
            },
        });
        created++;
        console.log(`  ✅ Created: [${entry.category}] ${entry.question.substring(0, 50)}...`);
    }

    console.log(`\n🎉 Done! Created ${created} entries, skipped ${skipped} existing.`);
}

seedAiKnowledge()
    .catch(error => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
