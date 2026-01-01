import { CopyStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { differenceInDays, differenceInHours } from 'date-fns';

interface TimelineFilters {
  copyId?: string;
  fromStatus?: CopyStatus;
  toStatus?: CopyStatus;
  startDate?: Date;
  endDate?: Date;
}

async function verifyProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true },
  });

  if (!project) {
    throw new AppError(404, 'Projeto não encontrado');
  }

  if (project.userId !== userId) {
    throw new AppError(403, 'Acesso negado');
  }
}

export async function getTimeline(
  projectId: string,
  userId: string,
  filters?: TimelineFilters
) {
  await verifyProjectOwnership(projectId, userId);

  const where: Record<string, unknown> = {
    copy: { projectId },
  };

  if (filters?.copyId) {
    where.copyId = filters.copyId;
  }

  if (filters?.fromStatus) {
    where.fromStatus = filters.fromStatus;
  }

  if (filters?.toStatus) {
    where.toStatus = filters.toStatus;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      (where.createdAt as Record<string, Date>).gte = filters.startDate;
    }
    if (filters.endDate) {
      (where.createdAt as Record<string, Date>).lte = filters.endDate;
    }
  }

  const statusChanges = await prisma.statusChange.findMany({
    where,
    include: {
      copy: {
        select: {
          id: true,
          title: true,
          content: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate time spent in previous status
  const enrichedChanges = statusChanges.map((change, index) => {
    // Find the previous status change for this copy
    const previousChange = statusChanges.find(
      (sc, i) => i > index && sc.copyId === change.copyId
    );

    let timeInPreviousStatus = null;
    if (previousChange) {
      const diff = differenceInDays(
        new Date(change.createdAt),
        new Date(previousChange.createdAt)
      );
      if (diff === 0) {
        const hours = differenceInHours(
          new Date(change.createdAt),
          new Date(previousChange.createdAt)
        );
        timeInPreviousStatus = `${hours} hora${hours !== 1 ? 's' : ''}`;
      } else {
        timeInPreviousStatus = `${diff} dia${diff !== 1 ? 's' : ''}`;
      }
    }

    return {
      ...change,
      timeInPreviousStatus,
    };
  });

  return enrichedChanges;
}

export async function getCopyTimeline(copyId: string, userId: string) {
  const copy = await prisma.copy.findUnique({
    where: { id: copyId },
    include: { project: { select: { userId: true } } },
  });

  if (!copy) {
    throw new AppError(404, 'Copy não encontrada');
  }

  if (copy.project.userId !== userId) {
    throw new AppError(403, 'Acesso negado');
  }

  const statusChanges = await prisma.statusChange.findMany({
    where: { copyId },
    orderBy: { createdAt: 'asc' },
  });

  // Add creation event
  const timeline = [
    {
      id: 'creation',
      type: 'creation' as const,
      date: copy.createdAt,
      description: 'Copy criada',
    },
    ...statusChanges.map((sc, index) => {
      const previousChange = statusChanges[index - 1];
      let timeInPreviousStatus = null;

      if (previousChange) {
        const diff = differenceInDays(
          new Date(sc.createdAt),
          new Date(previousChange.createdAt)
        );
        if (diff === 0) {
          const hours = differenceInHours(
            new Date(sc.createdAt),
            new Date(previousChange.createdAt)
          );
          timeInPreviousStatus = `${hours} hora${hours !== 1 ? 's' : ''}`;
        } else {
          timeInPreviousStatus = `${diff} dia${diff !== 1 ? 's' : ''}`;
        }
      }

      return {
        id: sc.id,
        type: 'status_change' as const,
        date: sc.createdAt,
        fromStatus: sc.fromStatus,
        toStatus: sc.toStatus,
        metrics: sc.metrics,
        timeInPreviousStatus,
        description: `Status alterado de "${sc.fromStatus}" para "${sc.toStatus}"`,
      };
    }),
  ];

  return timeline;
}
