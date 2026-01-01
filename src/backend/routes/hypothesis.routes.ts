import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createHypothesis,
  getHypothesesByProject,
  getHypothesisById,
  updateHypothesis,
  concludeHypothesis,
  deleteHypothesis,
} from '../services/hypothesis.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const hypothesisRouter = Router();

hypothesisRouter.use(authMiddleware);

const createHypothesisSchema = z.object({
  projectId: z.string().min(1, 'Projeto é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  variableA: z.string().min(1, 'Variável A é obrigatória'),
  variableB: z.string().min(1, 'Variável B é obrigatória'),
});

const updateHypothesisSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'concluded', 'cancelled']).optional(),
});

const concludeHypothesisSchema = z.object({
  conclusion: z.string().min(1, 'Conclusão é obrigatória'),
  winningVariable: z.enum(['A', 'B', 'inconclusive']),
});

hypothesisRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createHypothesisSchema.parse(req.body);
    const hypothesis = await createHypothesis(data, req.userId!);
    res.status(201).json(hypothesis);
  } catch (error) {
    next(error);
  }
});

hypothesisRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId é obrigatório' });
    }

    const hypotheses = await getHypothesesByProject(projectId as string, req.userId!);
    res.json(hypotheses);
  } catch (error) {
    next(error);
  }
});

hypothesisRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const hypothesis = await getHypothesisById(req.params.id, req.userId!);
    res.json(hypothesis);
  } catch (error) {
    next(error);
  }
});

hypothesisRouter.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateHypothesisSchema.parse(req.body);
    const hypothesis = await updateHypothesis(req.params.id, req.userId!, data);
    res.json(hypothesis);
  } catch (error) {
    next(error);
  }
});

hypothesisRouter.post('/:id/conclude', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = concludeHypothesisSchema.parse(req.body);
    const hypothesis = await concludeHypothesis(req.params.id, req.userId!, data);
    res.json(hypothesis);
  } catch (error) {
    next(error);
  }
});

hypothesisRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await deleteHypothesis(req.params.id, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
