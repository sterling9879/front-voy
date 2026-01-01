// Enums
export type CopyStatus = 'testing' | 'champion' | 'scaling' | 'failed' | 'archived';
export type Tone = 'formal' | 'casual' | 'urgent' | 'empathetic' | 'provocative';
export type HookType = 'question' | 'statement' | 'number' | 'story' | 'challenge';
export type ProofType = 'social' | 'authority' | 'logic' | 'testimonial' | 'none';
export type CtaStyle = 'direct' | 'soft' | 'urgency' | 'curiosity';
export type CreativeType = 'ugc' | 'static' | 'carousel' | 'video' | 'other';
export type AudienceTemperature = 'cold' | 'warm' | 'hot';
export type HypothesisStatus = 'active' | 'concluded' | 'cancelled';
export type WinningVariable = 'A' | 'B' | 'inconclusive';
export type Trigger = 'scarcity' | 'urgency' | 'curiosity' | 'social_proof' | 'authority' | 'reciprocity' | 'fomo';

// Interfaces
export interface User {
  id: string;
  email: string;
  name: string;
  niche?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  niche: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceSegment {
  temperature: AudienceTemperature;
  ageRange?: string;
  gender?: 'male' | 'female' | 'all';
  interests?: string[];
}

export interface CopyMetrics {
  ctr?: number;
  roas?: number;
  cpa?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface Copy {
  id: string;
  projectId: string;
  title: string;
  content: string;
  status: CopyStatus;
  ctr?: number;
  roas?: number;
  cpa?: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  campaignsCount: number;
  creativeUrl?: string;
  creativeType?: CreativeType;
  audienceSegment?: AudienceSegment;
  hypothesisId?: string;
  hypothesisVariable?: string;
  parentCopyId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  statusChangedAt: string;
  dna?: CopyDNA;
  confidenceScore?: number;
}

export interface CopyDNA {
  id: string;
  copyId: string;
  tone: Tone;
  hookLength: number;
  hookType: HookType;
  proofType: ProofType;
  ctaStyle: CtaStyle;
  hasStorytelling: boolean;
  triggers: Trigger[];
  wordCount: number;
  emojiCount: number;
  analyzedAt: string;
}

export interface CopyVersion {
  id: string;
  copyId: string;
  versionNumber: number;
  content: string;
  metrics?: CopyMetrics;
  changeDescription?: string;
  createdAt: string;
}

export interface FailureReason {
  id: string;
  copyId: string;
  reasons: string[];
  notes?: string;
  createdAt: string;
}

export interface Hypothesis {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  variableA: string;
  variableB: string;
  status: HypothesisStatus;
  conclusion?: string;
  winningVariable?: WinningVariable;
  createdAt: string;
  concludedAt?: string;
}

export interface StatusChange {
  id: string;
  copyId: string;
  fromStatus: CopyStatus;
  toStatus: CopyStatus;
  metrics?: CopyMetrics;
  createdAt: string;
}

export interface NicheBenchmark {
  id: string;
  niche: string;
  avgChampionRate: number;
  avgRoas: number;
  topPercentileRoas: number;
  sampleSize: number;
  updatedAt: string;
}

// API Request/Response types
export interface CreateCopyRequest {
  projectId: string;
  title: string;
  content: string;
  status?: CopyStatus;
  creativeUrl?: string;
  creativeType?: CreativeType;
  audienceSegment?: AudienceSegment;
  hypothesisId?: string;
  hypothesisVariable?: string;
}

export interface UpdateCopyRequest {
  title?: string;
  content?: string;
  status?: CopyStatus;
  ctr?: number;
  roas?: number;
  cpa?: number;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  campaignsCount?: number;
  creativeUrl?: string;
  creativeType?: CreativeType;
  audienceSegment?: AudienceSegment;
  hypothesisId?: string;
  hypothesisVariable?: string;
}

export interface UpdateCopyStatusRequest {
  status: CopyStatus;
  metrics?: Partial<CopyMetrics>;
  failureReasons?: string[];
  failureNotes?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  niche: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  niche?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  niche?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateHypothesisRequest {
  projectId: string;
  name: string;
  description?: string;
  variableA: string;
  variableB: string;
}

export interface ConcludeHypothesisRequest {
  conclusion: string;
  winningVariable: WinningVariable;
}

// Dashboard types
export interface DashboardStats {
  totalCopies: number;
  championRate: number;
  championRateLast30Days: number;
  evolutionPercentage: number;
  avgChampionRoas: number;
  copiesByStatus: Record<CopyStatus, number>;
}

export interface EvolutionData {
  date: string;
  championRate: number;
  avgRoas: number;
}

export interface HeatmapData {
  element: string;
  champion: number;
  scaling: number;
  failed: number;
}

export interface InsightData {
  pattern: string;
  evidence: string;
  action: string;
}

export interface PredictionScore {
  score: number;
  alignedPatterns: string[];
  differentPatterns: string[];
}
