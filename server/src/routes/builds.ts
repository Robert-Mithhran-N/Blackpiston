import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';

const router = Router();

// Zod Validation Schema
const productImageSchema = z.object({
  url: z.string().url(),
  public_id: z.string().optional(),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional().default(false),
});

const buildSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  components: z.array(z.string()).optional().default([]),
  price: z.coerce.number().min(0, 'Price must be positive'),
  images: z.array(productImageSchema).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

// GET all builds (Admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [builds, total] = await Promise.all([
      prisma.build.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.build.count({ where })
    ]);

    res.json({
      builds,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get builds error:', error);
    res.status(500).json({ error: 'Failed to fetch builds' });
  }
});

// POST new build
router.post('/', async (req: Request, res: Response) => {
  try {
    const parseResult = buildSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.errors });
    }

    const data = parseResult.data;

    const build = await prisma.build.create({
      data: {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }
    });

    res.status(201).json({ message: 'Build created', build });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Slug must be unique' });
    console.error('Create build error:', error);
    res.status(500).json({ error: 'Failed to create build' });
  }
});

// PUT update build
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = buildSchema.partial().safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.errors });
    }

    const build = await prisma.build.update({
      where: { id },
      data: parseResult.data
    });

    res.json({ message: 'Build updated', build });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Build not found' });
    console.error('Update build error:', error);
    res.status(500).json({ error: 'Failed to update build' });
  }
});

// DELETE build
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.build.delete({ where: { id } });
    res.json({ message: 'Build deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Build not found' });
    console.error('Delete build error:', error);
    res.status(500).json({ error: 'Failed to delete build' });
  }
});

export default router;
