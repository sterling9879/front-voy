interface CopyData {
  campaignsCount: number;
  spend: number;
  createdAt: Date;
}

export function calculateConfidenceScore(copy: CopyData): number {
  // Campaign score: 30% weight, max at 5 campaigns
  const campaignScore = Math.min(copy.campaignsCount / 5, 1) * 30;

  // Spend score: 40% weight, max at R$1000
  const spendScore = Math.min(copy.spend / 1000, 1) * 40;

  // Time score: 15% weight, max at 14 days
  const daysActive = daysSince(copy.createdAt);
  const timeScore = Math.min(daysActive / 14, 1) * 15;

  // Consistency score: 15% weight (simplified - based on data completeness)
  const consistencyScore = calculateConsistency(copy) * 15;

  return Math.round(campaignScore + spendScore + timeScore + consistencyScore);
}

function daysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function calculateConsistency(copy: CopyData): number {
  // Simple consistency check based on available data
  let score = 0;

  if (copy.campaignsCount > 0) score += 0.25;
  if (copy.spend > 0) score += 0.25;
  if (copy.campaignsCount >= 3) score += 0.25;
  if (copy.spend >= 500) score += 0.25;

  return score;
}

export function getConfidenceLevel(score: number): {
  level: 'low' | 'medium' | 'high';
  label: string;
  color: string;
} {
  if (score <= 30) {
    return {
      level: 'low',
      label: 'Baixa confiança',
      color: 'text-red-600 bg-red-100',
    };
  }
  if (score <= 60) {
    return {
      level: 'medium',
      label: 'Confiança média',
      color: 'text-yellow-600 bg-yellow-100',
    };
  }
  return {
    level: 'high',
    label: 'Alta confiança',
    color: 'text-green-600 bg-green-100',
  };
}
