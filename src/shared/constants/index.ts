import type { CopyStatus, Trigger, Tone, HookType, ProofType, CtaStyle } from '../types';

export const COPY_STATUS_LABELS: Record<CopyStatus, string> = {
  testing: 'Em Teste',
  champion: 'Campeã',
  scaling: 'Escalando',
  failed: 'Não Validou',
  archived: 'Arquivada',
};

export const COPY_STATUS_COLORS: Record<CopyStatus, string> = {
  testing: 'bg-blue-100 text-blue-800',
  champion: 'bg-green-100 text-green-800',
  scaling: 'bg-purple-100 text-purple-800',
  failed: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

export const COPY_STATUS_ORDER: CopyStatus[] = [
  'testing',
  'champion',
  'scaling',
  'failed',
  'archived',
];

export const TRIGGER_LABELS: Record<Trigger, string> = {
  scarcity: 'Escassez',
  urgency: 'Urgência',
  curiosity: 'Curiosidade',
  social_proof: 'Prova Social',
  authority: 'Autoridade',
  reciprocity: 'Reciprocidade',
  fomo: 'FOMO',
};

export const TONE_LABELS: Record<Tone, string> = {
  formal: 'Formal',
  casual: 'Casual',
  urgent: 'Urgente',
  empathetic: 'Empático',
  provocative: 'Provocativo',
};

export const HOOK_TYPE_LABELS: Record<HookType, string> = {
  question: 'Pergunta',
  statement: 'Afirmação',
  number: 'Número',
  story: 'História',
  challenge: 'Desafio',
};

export const PROOF_TYPE_LABELS: Record<ProofType, string> = {
  social: 'Social',
  authority: 'Autoridade',
  logic: 'Lógica',
  testimonial: 'Depoimento',
  none: 'Nenhum',
};

export const CTA_STYLE_LABELS: Record<CtaStyle, string> = {
  direct: 'Direto',
  soft: 'Suave',
  urgency: 'Urgência',
  curiosity: 'Curiosidade',
};

export const FAILURE_REASONS = [
  { value: 'weak_hook', label: 'Hook fraco / não chamou atenção' },
  { value: 'confusing_body', label: 'Corpo da copy confuso ou longo demais' },
  { value: 'weak_cta', label: 'CTA fraco ou inexistente' },
  { value: 'unattractive_offer', label: 'Oferta não atrativa' },
  { value: 'wrong_audience', label: 'Público errado / segmentação ruim' },
  { value: 'creative_mismatch', label: 'Criativo não casou com a copy' },
  { value: 'bad_timing', label: 'Timing ruim (sazonalidade)' },
  { value: 'strong_competition', label: 'Concorrência muito forte' },
  { value: 'technical_issue', label: 'Problema técnico (página, checkout)' },
  { value: 'other', label: 'Outro' },
];

export const SUPPORTED_NICHES = [
  { value: 'suplementos', label: 'Suplementos' },
  { value: 'skincare', label: 'Skincare' },
  { value: 'emagrecimento', label: 'Emagrecimento' },
  { value: 'infoprodutos', label: 'Infoprodutos' },
  { value: 'ecommerce_moda', label: 'E-commerce Moda' },
  { value: 'ecommerce_eletronicos', label: 'E-commerce Eletrônicos' },
  { value: 'servicos_locais', label: 'Serviços Locais' },
  { value: 'saas_b2b', label: 'SaaS B2B' },
];

export const AUDIENCE_TEMPERATURE_LABELS = {
  cold: 'Frio',
  warm: 'Morno',
  hot: 'Quente',
};

export const CREATIVE_TYPE_LABELS = {
  ugc: 'UGC',
  static: 'Estático',
  carousel: 'Carrossel',
  video: 'Vídeo',
  other: 'Outro',
};

export const CONFIDENCE_LEVELS = {
  low: { min: 0, max: 30, label: 'Baixa confiança', color: 'text-red-600 bg-red-100' },
  medium: { min: 31, max: 60, label: 'Confiança média', color: 'text-yellow-600 bg-yellow-100' },
  high: { min: 61, max: 100, label: 'Alta confiança', color: 'text-green-600 bg-green-100' },
};
