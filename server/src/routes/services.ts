import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';

const router = Router();

function authenticateAdmin(req: Request, res: Response, next: Function) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: string;
        };

        if (!['ADMIN', 'STAFF'].includes(decoded.role)) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        (req as any).userId = decoded.userId;
        (req as any).userRole = decoded.role;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Zod Validation Schema
const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  duration: z.string().min(1, 'Duration is required'),
  category: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

// GET all services (Admin)
router.get('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', search, category, status } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category as string;
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.service.count({ where })
    ]);

    res.json({
      services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// POST new service
router.post('/', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const parseResult = serviceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.errors });
    }

    const data = parseResult.data;

    const service = await prisma.service.create({
      data: {
        ...data,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }
    });

    res.status(201).json({ message: 'Service created', service });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Slug must be unique' });
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT update service
router.put('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parseResult = serviceSchema.partial().safeParse(req.body);
    
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Validation failed', details: parseResult.error.errors });
    }

    const service = await prisma.service.update({
      where: { id },
      data: parseResult.data
    });

    res.json({ message: 'Service updated', service });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Service not found' });
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE service
router.delete('/:id', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    res.json({ message: 'Service deleted' });
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Service not found' });
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

export default router;
