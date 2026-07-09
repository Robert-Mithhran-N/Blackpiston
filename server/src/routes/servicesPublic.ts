import { Router, Request, Response } from 'express';
import prisma from '../config/database.js';

const router = Router();

// GET all visible & non-archived services (Public client route)
router.get('/', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        visible: true,
        isActive: true,
        status: {
          not: 'ARCHIVED'
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { featured: 'desc' }
      ]
    });

    res.json({ services });
  } catch (error) {
    console.error('Fetch public services error:', error);
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
});

// POST increment service views count (Public analytics)
router.post('/:id/view', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.update({
      where: { id },
      data: {
        views: { increment: 1 }
      }
    });
    res.json({ message: 'View tracked', views: service.views });
  } catch (error) {
    console.error('Track service view error:', error);
    res.status(500).json({ error: 'Failed to track service view' });
  }
});

// POST increment service clicks count (Public analytics)
router.post('/:id/click', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.update({
      where: { id },
      data: {
        clicks: { increment: 1 }
      }
    });
    res.json({ message: 'Click tracked', clicks: service.clicks });
  } catch (error) {
    console.error('Track service click error:', error);
    res.status(500).json({ error: 'Failed to track service click' });
  }
});

// POST increment service inquiries count (Public analytics)
router.post('/:id/inquiry', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.update({
      where: { id },
      data: {
        inquiries: { increment: 1 }
      }
    });
    res.json({ message: 'Inquiry tracked', inquiries: service.inquiries });
  } catch (error) {
    console.error('Track service inquiry error:', error);
    res.status(500).json({ error: 'Failed to track service inquiry' });
  }
});

export default router;
