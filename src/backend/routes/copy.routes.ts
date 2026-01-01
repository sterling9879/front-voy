import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createCopy,
  getCopiesByProject,
  getCopyById,
  updateCopy,
  updateCopyStatus,
  deleteCopy,
  getCopyVersions,
  restoreCopyVersion,
} from '../services/copy.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const copyRouter = Router();

copyRouter.use(authMiddleware);

const audienceSegmentSchema = z.object({
  temperature: z.enum(['cold', 'warm', 'hot']),
  ageRange: z.string().optional(),
  gender: z.enum(['male', 'female', 'all']).optional(),
  interests: z.array(z.string()).optional(),
}).optional();

const createCopySchema = z.object({
  projectId: z.string().min(1, 'Projeto é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  status: z.enum(['testing', 'champion', 'scaling', 'failed', 'archived']).optional(),
  creativeUrl: z.string().url().optional().or(z.literal('')),
  creativeType: z.enum(['ugc', 'static', 'carousel', 'video', 'other']).optional(),
  audienceSegment: audienceSegmentSchema,
  hypothesisId: z.string().optional(),
  hypothesisVariable: z.string().optional(),
});

const updateCopySchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  ctr: z.number().optional(),
  roas: z.number().optional(),
  cpa: z.number().optional(),
  spend: z.number().optional(),
  impressions: z.number().optional(),
  clicks: z.number().optional(),
  conversions: z.number().optional(),
  campaignsCount: z.number().optional(),
  creativeUrl: z.string().url().optional().or(z.literal('')),
  creativeType: z.enum(['ugc', 'static', 'carousel', 'video', 'other']).optional(),
  audienceSegment: audienceSegmentSchema,
  hypothesisId: z.string().optional().nullable(),
  hypothesisVariable: z.string().optional().nullable(),
});

const updateStatusSchema = z.object({
  status: z.enum(['testing', 'champion', 'scaling', 'failed', 'archived']),
  metrics: z.object({
    ctr: z.number().optional(),
    roas: z.number().optional(),
    cpa: z.number().optional(),
    spend: z.number().optional(),
    impressions: z.number().optional(),
    clicks: z.number().optional(),
    conversions: z.number().optional(),
  }).optional(),
  failureReasons: z.array(z.string()).optional(),
  failureNotes: z.string().optional(),
});

copyRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createCopySchema.parse(req.body);
    const copy = await createCopy(data, req.userId!);
    res.status(201).json(copy);
  } catch (error) {
    next(error);
  }
});

copyRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId, status, hypothesisId, creativeType, audienceTemperature } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const copies = await getCopiesByProject(
      projectId as string,
      req.userId!,
      {
        status: status as 'testing' | 'champion' | 'scaling' | 'failed' | 'archived' | undefined,
        hypothesisId: hypothesisId as string | undefined,
        creativeType: creativeType as string | undefined,
        audienceTemperature: audienceTemperature as string | undefined,
      }
    );

    res.json(copies);
  } catch (error) {
    next(error);
  }
});

copyRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const copy = await getCopyById(req.params.id, req.userId!);
    res.json(copy);
  } catch (error) {
    next(error);
  }
});

copyRouter.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateCopySchema.parse(req.body);
    const copy = await updateCopy(req.params.id, req.userId!, data);
    res.json(copy);
  } catch (error) {
    next(error);
  }
});

copyRouter.put('/:id/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateStatusSchema.parse(req.body);
    const copy = await updateCopyStatus(req.params.id, req.userId!, data);
    res.json(copy);
  } catch (error) {
    next(error);
  }
});

copyRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await deleteCopy(req.params.id, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

copyRouter.get('/:id/versions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const versions = await getCopyVersions(req.params.id, req.userId!);
    res.json(versions);
  } catch (error) {
    next(error);
  }
});

copyRouter.post('/:id/restore/:versionId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const copy = await restoreCopyVersion(req.params.id, req.params.versionId, req.userId!);
    res.json(copy);
  } catch (error) {
    next(error);
  }
});
