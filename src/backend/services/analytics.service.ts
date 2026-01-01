import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error.middleware';
import { generateInsights, generateAudienceSignature, generateCreativeCorrelation } from '../ai/gemini.service';
import { subDays, startOfDay, format } from 'date-fns';

export async function getDashboardStats(projectId: string, userId: string) {
  await verifyProjectOwnership(projectId, userId);

  const copies = await prisma.copy.findMany({
    where: { projectId },
    include: { dna: true },
  });

  const totalCopies = copies.length;
  const championCopies = copies.filter((c) => c.status === 'champion');
  const scalingCopies = copies.filter((c) => c.status === 'scaling');
  const failedCopies = copies.filter((c) => c.status === 'failed');
  const testedCopies = copies.filter((c) => c.status !== 'testing' && c.status !== 'archived');

  // Champion rate
  const championRate = testedCopies.length > 0
    ? ((championCopies.length + scalingCopies.length) / testedCopies.length) * 100
    : 0;

  // Last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentCopies = copies.filter(
    (c) => new Date(c.statusChangedAt) >= thirtyDaysAgo
  );
  const recentChampions = recentCopies.filter(
    (c) => c.status === 'champion' || c.status === 'scaling'
  );
  const recentTested = recentCopies.filter(
    (c) => c.status !== 'testing' && c.status !== 'archived'
  );
  const championRateLast30Days = recentTested.length > 0
    ? (recentChampions.length / recentTested.length) * 100
    : 0;

  // Previous 30 days for comparison
  const sixtyDaysAgo = subDays(new Date(), 60);
  const previousCopies = copies.filter(
    (c) =>
      new Date(c.statusChangedAt) >= sixtyDaysAgo &&
      new Date(c.statusChangedAt) < thirtyDaysAgo
  );
  const previousChampions = previousCopies.filter(
    (c) => c.status === 'champion' || c.status === 'scaling'
  );
  const previousTested = previousCopies.filter(
    (c) => c.status !== 'testing' && c.status !== 'archived'
  );
  const previousRate = previousTested.length > 0
    ? (previousChampions.length / previousTested.length) * 100
    : 0;

  const evolutionPercentage = previousRate > 0
    ? ((championRateLast30Days - previousRate) / previousRate) * 100
    : 0;

  // Average ROAS of champions
  const championsWithRoas = [...championCopies, ...scalingCopies].filter(
    (c) => c.roas != null
  );
  const avgChampionRoas = championsWithRoas.length > 0
    ? championsWithRoas.reduce((sum, c) => sum + (c.roas || 0), 0) / championsWithRoas.length
    : 0;

  // Copies by status
  const copiesByStatus = {
    testing: copies.filter((c) => c.status === 'testing').length,
    champion: championCopies.length,
    scaling: scalingCopies.length,
    failed: failedCopies.length,
    archived: copies.filter((c) => c.status === 'archived').length,
  };

  return {
    totalCopies,
    championRate: Math.round(championRate * 10) / 10,
    championRateLast30Days: Math.round(championRateLast30Days * 10) / 10,
    evolutionPercentage: Math.round(evolutionPercentage * 10) / 10,
    avgChampionRoas: Math.round(avgChampionRoas * 100) / 100,
    copiesByStatus,
  };
}

export async function getEvolutionData(projectId: string, userId: string) {
  await verifyProjectOwnership(projectId, userId);

  const statusChanges = await prisma.statusChange.findMany({
    where: {
      copy: { projectId },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Group by week
  const weeklyData: Record<string, { champions: number; total: number; roasSum: number; roasCount: number }> = {};

  for (const change of statusChanges) {
    const weekStart = format(startOfDay(new Date(change.createdAt)), 'yyyy-MM-dd');

    if (!weeklyData[weekStart]) {
      weeklyData[weekStart] = { champions: 0, total: 0, roasSum: 0, roasCount: 0 };
    }

    if (change.toStatus === 'champion' || change.toStatus === 'scaling') {
      weeklyData[weekStart].champions++;
      const metrics = change.metrics as { roas?: number } | null;
      if (metrics?.roas) {
        weeklyData[weekStart].roasSum += metrics.roas;
        weeklyData[weekStart].roasCount++;
      }
    }

    if (change.toStatus !== 'testing' && change.toStatus !== 'archived') {
      weeklyData[weekStart].total++;
    }
  }

  return Object.entries(weeklyData).map(([date, data]) => ({
    date,
    championRate: data.total > 0 ? (data.champions / data.total) * 100 : 0,
    avgRoas: data.roasCount > 0 ? data.roasSum / data.roasCount : 0,
  }));
}

export async function getHeatmapData(projectId: string, userId: string) {
  await verifyProjectOwnership(projectId, userId);

  const copies = await prisma.copy.findMany({
    where: { projectId },
    include: { dna: true },
  });

  const elements = [
    'scarcity', 'urgency', 'curiosity', 'social_proof', 'authority', 'reciprocity', 'fomo',
    'hook_question', 'hook_number', 'hook_story', 'storytelling', 'cta_direct', 'cta_urgency', 'tone_casual'
  ];

  const heatmapData = elements.map((element) => {
    const getPresence = (copy: typeof copies[0]) => {
      if (!copy.dna) return false;

      if (element.startsWith('hook_')) {
        return copy.dna.hookType === element.replace('hook_', '');
      }
      if (element.startsWith('cta_')) {
        return copy.dna.ctaStyle === element.replace('cta_', '');
      }
      if (element.startsWith('tone_')) {
        return copy.dna.tone === element.replace('tone_', '');
      }
      if (element === 'storytelling') {
        return copy.dna.hasStorytelling;
      }
      return copy.dna.triggers.includes(element);
    };

    const champions = copies.filter((c) => c.status === 'champion' || c.status === 'scaling');
    const failed = copies.filter((c) => c.status === 'failed');

    const championPresence = champions.filter(getPresence).length;
    const failedPresence = failed.filter(getPresence).length;

    return {
      element,
      champion: champions.length > 0 ? (championPresence / champions.length) * 100 : 0,
      scaling: 0,
      failed: failed.length > 0 ? (failedPresence / failed.length) * 100 : 0,
    };
  });

  return heatmapData;
}

export async function getInsights(projectId: string, userId: string) {
  await verifyProjectOwnership(projectId, userId);

  const copies = await prisma.copy.findMany({
    where: { projectId },
    include: { dna: true, failureReason: true },
  });

  // Need at least 20 copies for meaningful insights
  if (copies.length < 20) {
    return {
      insights: [],
      message: 'São necessárias pelo menos 20 copies para gerar insights. Você tem ' + copies.length + '.',
    };
  }

  const champions = copies.filter((c) => c.status === 'champion' || c.status === 'scaling');
  const failed = copies.filter((c) => c.status === 'failed');

  const championData = champions.map((c) => ({
    title: c.title,
    dna: c.dna,
    metrics: { ctr: c.ctr, roas: c.roas, spend: c.spend },
  }));

  const failedData = failed.map((c) => ({
    title: c.title,
    dna: c.dna,
    metrics: { ctr: c.ctr, roas: c.roas, spend: c.spend },
    failureReasons: c.failureReason?.reasons,
  }));

  const insights = await generateInsights(championData, failedData);

  return { insights };
}

export async function getAudienceSignature(
  projectId: string,
  userId: string,
  segment: string
) {
  await verifyProjectOwnership(projectId, userId);

  const copies = await prisma.copy.findMany({
    where: { projectId },
    include: { dna: true },
  });

  const segmentCopies = copies.filter((c) => {
    const audience = c.audienceSegment as { temperature?: string } | null;
    return audience?.temperature === segment;
  });

  if (segmentCopies.length < 10) {
    return {
      signature: null,
      message: `São necessárias pelo menos 10 copies com audiência "${segment}". Você tem ${segmentCopies.length}.`,
    };
  }

  const champions = segmentCopies.filter((c) => c.status === 'champion' || c.status === 'scaling');
  const failed = segmentCopies.filter((c) => c.status === 'failed');

  const signature = await generateAudienceSignature(
    segment,
    champions.map((c) => ({ dna: c.dna, metrics: { roas: c.roas } })),
    failed.map((c) => ({ dna: c.dna, metrics: { roas: c.roas } }))
  );

  return { signature };
}

export async function getBenchmark(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(404, 'Projeto não encontrado');
  }

  if (project.userId !== userId) {
    throw new AppError(403, 'Acesso negado');
  }

  const benchmark = await prisma.nicheBenchmark.findUnique({
    where: { niche: project.niche },
  });

  const stats = await getDashboardStats(projectId, userId);

  return {
    userStats: {
      championRate: stats.championRate,
      avgRoas: stats.avgChampionRoas,
    },
    benchmark: benchmark || {
      avgChampionRate: 25,
      avgRoas: 2.5,
      topPercentileRoas: 5.0,
      sampleSize: 0,
    },
    niche: project.niche,
  };
}

export async function getFailureReasons(projectId: string, userId: string) {
  await verifyProjectOwnership(projectId, userId);

  const failureReasons = await prisma.failureReason.findMany({
    where: {
      copy: { projectId },
    },
  });

  // Aggregate reasons
  const reasonCounts: Record<string, number> = {};
  let totalReasons = 0;

  for (const fr of failureReasons) {
    for (const reason of fr.reasons) {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      totalReasons++;
    }
  }

  const aggregated = Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: (count / totalReasons) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return aggregated;
}

export async function getCreativeCorrelation(projectId: string, userId: string) {
  await verifyProjectOwnership(projectId, userId);

  const copies = await prisma.copy.findMany({
    where: {
      projectId,
      creativeType: { not: null },
    },
    include: { dna: true },
  });

  if (copies.length < 15) {
    return {
      correlation: null,
      message: `São necessárias pelo menos 15 copies com criativo. Você tem ${copies.length}.`,
    };
  }

  const copiesData = copies.map((c) => ({
    creativeType: c.creativeType,
    status: c.status,
    dna: c.dna,
    metrics: { roas: c.roas, ctr: c.ctr },
  }));

  const correlation = await generateCreativeCorrelation(copiesData);

  return { correlation };
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
