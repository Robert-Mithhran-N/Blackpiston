import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';

const router = Router();

// Zod Validation Schema
const blogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  isPublished: z.boolean().optional().default(false),
});

// GET all blog posts (Admin)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search, category, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category as string;
    if (status === 'published') where.isPublished = true;
    if (status === 'draft') where.isPublished = false;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.blog.count({ where })
    ]);

    res.json({
      blogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// POST new blog post
router.post('/', async (req: Request, res: Response) => {
  try {
    const parseResult = blogSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.errors });
    }

    const data = parseResult.data;
    const authorId = (req as any).userId; // Assuming authenticateAdmin middleware adds this

    const blog = await prisma.blog.create({
      data: {
        ...data,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        authorId: authorId || null
      }
    });

    res.status(201).json({ message: 'Blog post created', blog });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Slug must be unique' });
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT update blog post
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = blogSchema.partial().safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.errors });
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: parseResult.data
    });

    res.json({ message: 'Blog post updated', blog });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Blog post not found' });
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE blog post
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { id } });
    res.json({ message: 'Blog post deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Blog post not found' });
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;
