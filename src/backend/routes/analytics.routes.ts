import { Router, Response, NextFunction } from 'express';
import {
  getDashboardStats,
  getEvolutionData,
  getHeatmapData,
  getInsights,
  getAudienceSignature,
  getBenchmark,
  getFailureReasons,
  getCreativeCorrelation,
} from '../services/analytics.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const analyticsRouter = Router();

analyticsRouter.use(authMiddleware);

analyticsRouter.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const stats = await getDashboardStats(projectId as string, req.userId!);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/evolution', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const data = await getEvolutionData(projectId as string, req.userId!);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/heatmap', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const data = await getHeatmapData(projectId as string, req.userId!);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/insights', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const result = await getInsights(projectId as string, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/audience/:segment', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const result = await getAudienceSignature(
      projectId as string,
      req.userId!,
      req.params.segment
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/benchmark', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const result = await getBenchmark(projectId as string, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/failure-reasons', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const result = await getFailureReasons(projectId as string, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

analyticsRouter.get('/creative-correlation', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const result = await getCreativeCorrelation(projectId as string, req.userId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});
