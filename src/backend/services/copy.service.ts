import { CopyStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { analyzeCopyDNA } from '../ai/gemini.service';
import { calculateConfidenceScore } from './confidence.service';

export interface CreateCopyData {
  projectId: string;
  title: string;
  content: string;
  status?: CopyStatus;
  creativeUrl?: string;
  creativeType?: 'ugc' | 'static' | 'carousel' | 'video' | 'other';
  audienceSegment?: {
    temperature: 'cold' | 'warm' | 'hot';
    ageRange?: string;
    gender?: 'male' | 'female' | 'all';
    interests?: string[];
  };
  hypothesisId?: string;
  hypothesisVariable?: string;
}

export interface UpdateCopyData {
  title?: string;
  content?: string;
  ctr?: number;
  roas?: number;
  cpa?: number;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  campaignsCount?: number;
  creativeUrl?: string;
  creativeType?: 'ugc' | 'static' | 'carousel' | 'video' | 'other';
  audienceSegment?: {
    temperature: 'cold' | 'warm' | 'hot';
    ageRange?: string;
    gender?: 'male' | 'female' | 'all';
    interests?: string[];
  };
  hypothesisId?: string | null;
  hypothesisVariable?: string | null;
}

export interface UpdateCopyStatusData {
  status: CopyStatus;
  metrics?: {
    ctr?: number;
    roas?: number;
    cpa?: number;
    spend?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
  };
  failureReasons?: string[];
  failureNotes?: string;
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

async function verifyCopyOwnership(copyId: string, userId: string) {
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

  return copy;
}

export async function createCopy(data: CreateCopyData, userId: string) {
  await verifyProjectOwnership(data.projectId, userId);

  const copy = await prisma.copy.create({
    data: {
      projectId: data.projectId,
      title: data.title,
      content: data.content,
      status: data.status || 'testing',
      creativeUrl: data.creativeUrl,
      creativeType: data.creativeType,
      audienceSegment: data.audienceSegment,
      hypothesisId: data.hypothesisId,
      hypothesisVariable: data.hypothesisVariable,
    },
    include: {
      dna: true,
    },
  });

  // Analyze DNA asynchronously
  analyzeCopyDNA(copy.content)
    .then(async (dnaData) => {
      await prisma.copyDNA.create({
        data: {
          copyId: copy.id,
          ...dnaData,
        },
      });
    })
    .catch((error) => {
      console.error('Error analyzing copy DNA:', error);
    });

  return copy;
}

export async function getCopiesByProject(
  projectId: string,
  userId: string,
  filters?: {
    status?: CopyStatus;
    hypothesisId?: string;
    creativeType?: string;
    audienceTemperature?: string;
  }
) {
  await verifyProjectOwnership(projectId, userId);

  const where: Record<string, unknown> = { projectId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.hypothesisId) {
    where.hypothesisId = filters.hypothesisId;
  }

  if (filters?.creativeType) {
    where.creativeType = filters.creativeType;
  }

  const copies = await prisma.copy.findMany({
    where,
    include: {
      dna: true,
      failureReason: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Calculate confidence score for each copy
  const copiesWithConfidence = copies.map((copy) => ({
    ...copy,
    confidenceScore: calculateConfidenceScore(copy),
  }));

  // Filter by audience temperature if provided
  if (filters?.audienceTemperature) {
    return copiesWithConfidence.filter((copy) => {
      const segment = copy.audienceSegment as { temperature?: string } | null;
      return segment?.temperature === filters.audienceTemperature;
    });
  }

  return copiesWithConfidence;
}

export async function getCopyById(copyId: string, userId: string) {
  const copy = await verifyCopyOwnership(copyId, userId);

  const fullCopy = await prisma.copy.findUnique({
    where: { id: copyId },
    include: {
      dna: true,
      failureReason: true,
      versions: {
        orderBy: { versionNumber: 'desc' },
      },
      statusChanges: {
        orderBy: { createdAt: 'desc' },
      },
      hypothesis: true,
    },
  });

  return {
    ...fullCopy,
    confidenceScore: calculateConfidenceScore(copy),
  };
}

export async function updateCopy(
  copyId: string,
  userId: string,
  data: UpdateCopyData
) {
  const existingCopy = await verifyCopyOwnership(copyId, userId);

  // If content is being updated, create a version snapshot
  if (data.content && data.content !== existingCopy.content) {
    await prisma.copyVersion.create({
      data: {
        copyId,
        versionNumber: existingCopy.version,
        content: existingCopy.content,
        metrics: {
          ctr: existingCopy.ctr,
          roas: existingCopy.roas,
          cpa: existingCopy.cpa,
          spend: existingCopy.spend,
          impressions: existingCopy.impressions,
          clicks: existingCopy.clicks,
          conversions: existingCopy.conversions,
        },
        changeDescription: 'Conteúdo atualizado',
      },
    });

    // Update version number
    data = { ...data } as UpdateCopyData & { version: number };
    (data as UpdateCopyData & { version: number }).version = existingCopy.version + 1;

    // Re-analyze DNA for new content
    analyzeCopyDNA(data.content!)
      .then(async (dnaData) => {
        await prisma.copyDNA.upsert({
          where: { copyId },
          create: { copyId, ...dnaData },
          update: dnaData,
        });
      })
      .catch((error) => {
        console.error('Error analyzing copy DNA:', error);
      });
  }

  const updated = await prisma.copy.update({
    where: { id: copyId },
    data,
    include: {
      dna: true,
      failureReason: true,
    },
  });

  return {
    ...updated,
    confidenceScore: calculateConfidenceScore(updated),
  };
}

export async function updateCopyStatus(
  copyId: string,
  userId: string,
  data: UpdateCopyStatusData
) {
  const existingCopy = await verifyCopyOwnership(copyId, userId);

  // Create status change record
  await prisma.statusChange.create({
    data: {
      copyId,
      fromStatus: existingCopy.status,
      toStatus: data.status,
      metrics: data.metrics || {
        ctr: existingCopy.ctr,
        roas: existingCopy.roas,
        cpa: existingCopy.cpa,
        spend: existingCopy.spend,
        impressions: existingCopy.impressions,
        clicks: existingCopy.clicks,
        conversions: existingCopy.conversions,
      },
    },
  });

  // If moving to failed, save failure reason
  if (data.status === 'failed' && data.failureReasons?.length) {
    await prisma.failureReason.upsert({
      where: { copyId },
      create: {
        copyId,
        reasons: data.failureReasons,
        notes: data.failureNotes,
      },
      update: {
        reasons: data.failureReasons,
        notes: data.failureNotes,
      },
    });
  }

  const updated = await prisma.copy.update({
    where: { id: copyId },
    data: {
      status: data.status,
      statusChangedAt: new Date(),
      ...(data.metrics && {
        ctr: data.metrics.ctr,
        roas: data.metrics.roas,
        cpa: data.metrics.cpa,
        spend: data.metrics.spend,
        impressions: data.metrics.impressions,
        clicks: data.metrics.clicks,
        conversions: data.metrics.conversions,
      }),
    },
    include: {
      dna: true,
      failureReason: true,
    },
  });

  return {
    ...updated,
    confidenceScore: calculateConfidenceScore(updated),
  };
}

export async function deleteCopy(copyId: string, userId: string) {
  await verifyCopyOwnership(copyId, userId);

  await prisma.copy.delete({
    where: { id: copyId },
  });
}

export async function getCopyVersions(copyId: string, userId: string) {
  await verifyCopyOwnership(copyId, userId);

  const versions = await prisma.copyVersion.findMany({
    where: { copyId },
    orderBy: { versionNumber: 'desc' },
  });

  return versions;
}

export async function restoreCopyVersion(
  copyId: string,
  versionId: string,
  userId: string
) {
  const existingCopy = await verifyCopyOwnership(copyId, userId);

  const version = await prisma.copyVersion.findUnique({
    where: { id: versionId },
  });

  if (!version || version.copyId !== copyId) {
    throw new AppError(404, 'Versão não encontrada');
  }

  // Create snapshot of current version
  await prisma.copyVersion.create({
    data: {
      copyId,
      versionNumber: existingCopy.version,
      content: existingCopy.content,
      metrics: {
        ctr: existingCopy.ctr,
        roas: existingCopy.roas,
        cpa: existingCopy.cpa,
        spend: existingCopy.spend,
        impressions: existingCopy.impressions,
        clicks: existingCopy.clicks,
        conversions: existingCopy.conversions,
      },
      changeDescription: `Restaurado para versão ${version.versionNumber}`,
    },
  });

  // Restore content
  const updated = await prisma.copy.update({
    where: { id: copyId },
    data: {
      content: version.content,
      version: existingCopy.version + 1,
    },
    include: {
      dna: true,
    },
  });

  // Re-analyze DNA
  analyzeCopyDNA(version.content)
    .then(async (dnaData) => {
      await prisma.copyDNA.upsert({
        where: { copyId },
        create: { copyId, ...dnaData },
        update: dnaData,
      });
    })
    .catch((error) => {
      console.error('Error analyzing copy DNA:', error);
    });

  return updated;
}
