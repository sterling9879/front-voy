import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';

export interface CreateProjectData {
  userId: string;
  name: string;
  description?: string;
  niche: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  niche?: string;
}

export async function createProject(data: CreateProjectData) {
  const project = await prisma.project.create({
    data: {
      userId: data.userId,
      name: data.name,
      description: data.description,
      niche: data.niche,
    },
  });

  return project;
}

export async function getProjectsByUser(userId: string) {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      _count: {
        select: { copies: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return projects;
}

export async function getProjectById(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: { copies: true, hypotheses: true },
      },
    },
  });

  if (!project) {
    throw new AppError(404, 'Projeto não encontrado');
  }

  if (project.userId !== userId) {
    throw new AppError(403, 'Acesso negado');
  }

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectData
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(404, 'Projeto não encontrado');
  }

  if (project.userId !== userId) {
    throw new AppError(403, 'Acesso negado');
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data,
  });

  return updated;
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(404, 'Projeto não encontrado');
  }

  if (project.userId !== userId) {
    throw new AppError(403, 'Acesso negado');
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
}
