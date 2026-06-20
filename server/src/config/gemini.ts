import { GoogleGenAI, Type } from '@google/genai';

// ============================================================
// Gemini AI Configuration — Product Content Generation
// ============================================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
    if (!ai) {
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables');
        }
        ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return ai;
}

// ============================================================
// Types
// ============================================================

export interface GeneratedContentSection {
    title: string;
    content: string;
}

export interface GeneratedSEO {
    title: string;
    description: string;
    keywords: string[];
}

export interface GeneratedProductContent {
    shortDescription: string;
    sections: GeneratedContentSection[];
    seo: GeneratedSEO;
    highlights: string[];
    tags: string[];
}

// ============================================================
// Product Content Generation
// ============================================================

export async function generateProductContent(input: {
    name: string;
    brand?: string;
    productType?: string;
    variantInfo?: string;
}): Promise<GeneratedProductContent> {
    const client = getAI();

    const productContext = [
        `Product Name: ${input.name}`,
        input.brand ? `Brand: ${input.brand}` : null,
        input.productType ? `Category/Type: ${input.productType}` : null,
        input.variantInfo ? `Variant Information: ${input.variantInfo}` : null,
    ].filter(Boolean).join('\n');

    const prompt = `You are a professional e-commerce product content writer for BlackPiston Garage, an Indian motorcycle accessories and gear store.

Given the following product information, generate comprehensive, accurate, and professional product content.

${productContext}

IMPORTANT RULES:
- Write in a professional yet engaging tone suitable for an Indian motorcycle accessories e-commerce site.
- Use actual, realistic product specifications based on your knowledge of this product or similar products.
- If you know specific details about this exact product, use them. Otherwise, use typical specifications for this type of product from this brand.
- Prices should be in INR context.
- Do NOT fabricate certifications or safety ratings unless you are confident they exist.
- Keep each section concise but informative (2-5 sentences or bullet points per section).
- For the short description, write exactly ONE compelling sentence (max 150 characters).
- Generate 5-8 relevant highlights that could be displayed as badges on the product page.
- Generate 5-10 relevant search tags (lowercase, hyphenated, no # prefix).

Generate the following structured content:

1. shortDescription — One-line compelling summary
2. sections — Array of content sections with these titles:
   - "Product Overview"
   - "Key Features"
   - "Material Used"
   - "Safety Certifications"
   - "Comfort & Fit"
   - "Manufacturer Details"
   - "Dimensions"
   - "Care Instructions"
   - "Warranty Information"
   - "Box Contents"
3. seo — SEO metadata:
   - title (max 60 chars, include brand and product type)
   - description (max 160 chars, compelling meta description)
   - keywords (8-12 relevant SEO keywords)
4. highlights — Feature badges (short phrases like "ECE Certified", "Dual Visor", "Lightweight Shell")
5. tags — Search tags for filtering

Return ONLY valid JSON matching the schema.`;

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    shortDescription: {
                        type: Type.STRING,
                        description: 'One-line compelling product summary (max 150 chars)',
                    },
                    sections: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                content: { type: Type.STRING },
                            },
                            required: ['title', 'content'],
                        },
                    },
                    seo: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            keywords: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                            },
                        },
                        required: ['title', 'description', 'keywords'],
                    },
                    highlights: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    tags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
                required: ['shortDescription', 'sections', 'seo', 'highlights', 'tags'],
            },
        },
    });

    const text = response.text;
    if (!text) {
        throw new Error('Gemini returned an empty response');
    }

    const parsed = JSON.parse(text) as GeneratedProductContent;

    // Validate essential fields
    if (!parsed.shortDescription || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        throw new Error('Gemini returned incomplete product content');
    }

    return parsed;
}

// ============================================================
// Single Section Regeneration
// ============================================================

export async function regenerateSection(input: {
    name: string;
    brand?: string;
    productType?: string;
    sectionTitle: string;
}): Promise<{ title: string; content: string }> {
    const client = getAI();

    const productContext = [
        `Product Name: ${input.name}`,
        input.brand ? `Brand: ${input.brand}` : null,
        input.productType ? `Category/Type: ${input.productType}` : null,
    ].filter(Boolean).join('\n');

    const prompt = `You are a professional e-commerce product content writer for BlackPiston Garage, an Indian motorcycle accessories store.

Given this product:
${productContext}

Generate ONLY the "${input.sectionTitle}" section content.

Rules:
- Write 2-5 sentences or bullet points
- Be accurate and professional
- Use realistic specifications based on your knowledge
- Keep it concise but informative

Return ONLY valid JSON with "title" and "content" fields.`;

    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                },
                required: ['title', 'content'],
            },
        },
    });

    const text = response.text;
    if (!text) {
        throw new Error('Gemini returned an empty response');
    }

    return JSON.parse(text);
}
