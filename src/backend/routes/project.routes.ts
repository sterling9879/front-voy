import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createProject,
  getProjectsByUser,
  getProjectById,
  updateProject,
  deleteProject,
} from '../services/project.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

export const projectRouter = Router();

projectRouter.use(authMiddleware);

const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  niche: z.string().min(1, 'Nicho é obrigatório'),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  niche: z.string().min(1).optional(),
});

projectRouter.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const project = await createProject({
      userId: req.userId!,
      ...data,
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

projectRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const projects = await getProjectsByUser(req.userId!);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

projectRouter.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const project = await getProjectById(req.params.id, req.userId!);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

projectRouter.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const project = await updateProject(req.params.id, req.userId!, data);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

projectRouter.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await deleteProject(req.params.id, req.userId!);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
