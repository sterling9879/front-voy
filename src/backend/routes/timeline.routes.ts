import { Router, Response, NextFunction } from 'express';
import { getTimeline, getCopyTimeline } from '../services/timeline.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const timelineRouter = Router();

timelineRouter.use(authMiddleware);

timelineRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, copyId, fromStatus, toStatus, startDate, endDate } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const timeline = await getTimeline(
      projectId as string,
      req.userId!,
      {
        copyId: copyId as string | undefined,
        fromStatus: fromStatus as 'testing' | 'champion' | 'scaling' | 'failed' | 'archived' | undefined,
        toStatus: toStatus as 'testing' | 'champion' | 'scaling' | 'failed' | 'archived' | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }
    );

    res.json(timeline);
  } catch (error) {
    next(error);
  }
});

timelineRouter.get('/copy/:copyId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const timeline = await getCopyTimeline(req.params.copyId, req.userId!);
    res.json(timeline);
  } catch (error) {
    next(error);
  }
});
