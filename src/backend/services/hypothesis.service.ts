import { HypothesisStatus, WinningVariable } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { calculateConfidenceScore } from './confidence.service';

export interface CreateHypothesisData {
  projectId: string;
  name: string;
  description?: string;
  variableA: string;
  variableB: string;
}

export interface ConcludeHypothesisData {
  conclusion: string;
  winningVariable: WinningVariable;
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

async function verifyHypothesisOwnership(hypothesisId: string, userId: string) {
  const hypothesis = await prisma.hypothesis.findUnique({
    where: { id: hypothesisId },
    include: { project: { select: { userId: true } } },
  });

  if (!hypothesis) {
    throw new AppError(404, 'Hipótese não encontrada');
  }

  if (hypothesis.project.userId !== userId) {
    throw new AppError(403, 'Acesso negado');
  }

  return hypothesis;
}

export async function createHypothesis(data: CreateHypothesisData, userId: string) {
  await verifyProjectOwnership(data.projectId, userId);

  const hypothesis = await prisma.hypothesis.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      description: data.description,
      variableA: data.variableA,
      variableB: data.variableB,
    },
  });

  return hypothesis;
}

export async function getHypothesesByProject(projectId: string, userId: string) {
  await verifyProjectOwnership(projectId, userId);

  const hypotheses = await prisma.hypothesis.findMany({
    where: { projectId },
    include: {
      copies: {
        include: { dna: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return hypotheses.map((h) => {
    const variableACopies = h.copies.filter((c) => c.hypothesisVariable === 'A');
    const variableBCopies = h.copies.filter((c) => c.hypothesisVariable === 'B');

    return {
      ...h,
      stats: {
        variableA: {
          count: variableACopies.length,
          avgRoas: calculateAvgRoas(variableACopies),
          avgConfidence: calculateAvgConfidence(variableACopies),
        },
        variableB: {
          count: variableBCopies.length,
          avgRoas: calculateAvgRoas(variableBCopies),
          avgConfidence: calculateAvgConfidence(variableBCopies),
        },
      },
    };
  });
}

export async function getHypothesisById(hypothesisId: string, userId: string) {
  const hypothesis = await verifyHypothesisOwnership(hypothesisId, userId);

  const fullHypothesis = await prisma.hypothesis.findUnique({
    where: { id: hypothesisId },
    include: {
      copies: {
        include: { dna: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const variableACopies = fullHypothesis!.copies.filter((c) => c.hypothesisVariable === 'A');
  const variableBCopies = fullHypothesis!.copies.filter((c) => c.hypothesisVariable === 'B');

  return {
    ...hypothesis,
    copies: fullHypothesis!.copies.map((c) => ({
      ...c,
      confidenceScore: calculateConfidenceScore(c),
    })),
    stats: {
      variableA: {
        copies: variableACopies.map((c) => ({
          ...c,
          confidenceScore: calculateConfidenceScore(c),
        })),
        count: variableACopies.length,
        avgRoas: calculateAvgRoas(variableACopies),
        avgConfidence: calculateAvgConfidence(variableACopies),
        championCount: variableACopies.filter((c) => c.status === 'champion' || c.status === 'scaling').length,
      },
      variableB: {
        copies: variableBCopies.map((c) => ({
          ...c,
          confidenceScore: calculateConfidenceScore(c),
        })),
        count: variableBCopies.length,
        avgRoas: calculateAvgRoas(variableBCopies),
        avgConfidence: calculateAvgConfidence(variableBCopies),
        championCount: variableBCopies.filter((c) => c.status === 'champion' || c.status === 'scaling').length,
      },
    },
    canConclude: canConcludeHypothesis(variableACopies, variableBCopies),
  };
}

export async function updateHypothesis(
  hypothesisId: string,
  userId: string,
  data: { name?: string; description?: string; status?: HypothesisStatus }
) {
  await verifyHypothesisOwnership(hypothesisId, userId);

  const updated = await prisma.hypothesis.update({
    where: { id: hypothesisId },
    data,
  });

  return updated;
}

export async function concludeHypothesis(
  hypothesisId: string,
  userId: string,
  data: ConcludeHypothesisData
) {
  await verifyHypothesisOwnership(hypothesisId, userId);

  const updated = await prisma.hypothesis.update({
    where: { id: hypothesisId },
    data: {
      status: 'concluded',
      conclusion: data.conclusion,
      winningVariable: data.winningVariable,
      concludedAt: new Date(),
    },
  });

  return updated;
}

export async function deleteHypothesis(hypothesisId: string, userId: string) {
  await verifyHypothesisOwnership(hypothesisId, userId);

  // Remove hypothesis reference from copies
  await prisma.copy.updateMany({
    where: { hypothesisId },
    data: { hypothesisId: null, hypothesisVariable: null },
  });

  await prisma.hypothesis.delete({
    where: { id: hypothesisId },
  });
}

// Helper functions
function calculateAvgRoas(copies: Array<{ roas: number | null }>): number {
  const copiesWithRoas = copies.filter((c) => c.roas != null);
  if (copiesWithRoas.length === 0) return 0;
  return copiesWithRoas.reduce((sum, c) => sum + (c.roas || 0), 0) / copiesWithRoas.length;
}

function calculateAvgConfidence(copies: Array<{ campaignsCount: number; spend: number; createdAt: Date }>): number {
  if (copies.length === 0) return 0;
  return copies.reduce((sum, c) => sum + calculateConfidenceScore(c), 0) / copies.length;
}

function canConcludeHypothesis(
  variableACopies: Array<{ campaignsCount: number; spend: number; createdAt: Date }>,
  variableBCopies: Array<{ campaignsCount: number; spend: number; createdAt: Date }>
): boolean {
  // Need at least 5 copies of each variable with medium+ confidence
  const mediumConfidence = 31;

  const qualifiedA = variableACopies.filter(
    (c) => calculateConfidenceScore(c) >= mediumConfidence
  );
  const qualifiedB = variableBCopies.filter(
    (c) => calculateConfidenceScore(c) >= mediumConfidence
  );

  return qualifiedA.length >= 5 && qualifiedB.length >= 5;
}
