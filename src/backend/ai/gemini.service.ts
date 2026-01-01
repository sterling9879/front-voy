import { GoogleGenerativeAI } from '@google/generative-ai';
import { DNA_ANALYSIS_PROMPT, INSIGHTS_PROMPT, AUDIENCE_SIGNATURE_PROMPT, CREATIVE_CORRELATION_PROMPT } from './prompts/dna-analysis';

interface CopyDNAResult {
  tone: 'formal' | 'casual' | 'urgent' | 'empathetic' | 'provocative';
  hookLength: number;
  hookType: 'question' | 'statement' | 'number' | 'story' | 'challenge';
  proofType: 'social' | 'authority' | 'logic' | 'testimonial' | 'none';
  ctaStyle: 'direct' | 'soft' | 'urgency' | 'curiosity';
  hasStorytelling: boolean;
  triggers: string[];
  wordCount: number;
  emojiCount: number;
}

interface Insight {
  pattern: string;
  evidence: string;
  action: string;
}

interface AudienceSignature {
  segment: string;
  winningPattern: {
    tone: string;
    hookType: string;
    triggers: string[];
    ctaStyle: string;
  };
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

interface CreativeCorrelation {
  correlations: Array<{
    finding: string;
    creativeType: string;
    strength: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  bestCombinations: Array<{
    creativeType: string;
    idealDNA: {
      tone: string;
      hookType: string;
      triggers: string[];
    };
  }>;
}

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function extractJSON(text: string): string {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return text;
}

export async function analyzeCopyDNA(content: string): Promise<CopyDNAResult> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = DNA_ANALYSIS_PROMPT.replace('{copy_content}', content);
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonStr = extractJSON(response);
    const parsed = JSON.parse(jsonStr) as CopyDNAResult;

    // Validate and sanitize the response
    return {
      tone: validateEnum(parsed.tone, ['formal', 'casual', 'urgent', 'empathetic', 'provocative'], 'casual'),
      hookLength: typeof parsed.hookLength === 'number' ? parsed.hookLength : countWords(getHook(content)),
      hookType: validateEnum(parsed.hookType, ['question', 'statement', 'number', 'story', 'challenge'], 'statement'),
      proofType: validateEnum(parsed.proofType, ['social', 'authority', 'logic', 'testimonial', 'none'], 'none'),
      ctaStyle: validateEnum(parsed.ctaStyle, ['direct', 'soft', 'urgency', 'curiosity'], 'direct'),
      hasStorytelling: typeof parsed.hasStorytelling === 'boolean' ? parsed.hasStorytelling : false,
      triggers: Array.isArray(parsed.triggers) ? parsed.triggers.filter(t =>
        ['scarcity', 'urgency', 'curiosity', 'social_proof', 'authority', 'reciprocity', 'fomo'].includes(t)
      ) : [],
      wordCount: typeof parsed.wordCount === 'number' ? parsed.wordCount : countWords(content),
      emojiCount: typeof parsed.emojiCount === 'number' ? parsed.emojiCount : countEmojis(content),
    };
  } catch (error) {
    console.error('Error analyzing copy DNA with Gemini:', error);
    // Return fallback analysis
    return fallbackAnalysis(content);
  }
}

export async function generateInsights(
  championCopies: unknown[],
  failedCopies: unknown[]
): Promise<Insight[]> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = INSIGHTS_PROMPT
      .replace('{champion_copies_data}', JSON.stringify(championCopies, null, 2))
      .replace('{failed_copies_data}', JSON.stringify(failedCopies, null, 2));

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonStr = extractJSON(response);
    const parsed = JSON.parse(jsonStr) as Insight[];

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error generating insights with Gemini:', error);
    return [];
  }
}

export async function generateAudienceSignature(
  segmentName: string,
  championCopies: unknown[],
  failedCopies: unknown[]
): Promise<AudienceSignature | null> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = AUDIENCE_SIGNATURE_PROMPT
      .replace('{segment_name}', segmentName)
      .replace('{champion_data}', JSON.stringify(championCopies, null, 2))
      .replace('{failed_data}', JSON.stringify(failedCopies, null, 2));

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonStr = extractJSON(response);
    return JSON.parse(jsonStr) as AudienceSignature;
  } catch (error) {
    console.error('Error generating audience signature with Gemini:', error);
    return null;
  }
}

export async function generateCreativeCorrelation(
  copiesWithCreative: unknown[]
): Promise<CreativeCorrelation | null> {
  try {
    const ai = getGenAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = CREATIVE_CORRELATION_PROMPT
      .replace('{copies_with_creative_data}', JSON.stringify(copiesWithCreative, null, 2));

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const jsonStr = extractJSON(response);
    return JSON.parse(jsonStr) as CreativeCorrelation;
  } catch (error) {
    console.error('Error generating creative correlation with Gemini:', error);
    return null;
  }
}

// Helper functions
function validateEnum<T extends string>(value: T, options: T[], defaultValue: T): T {
  return options.includes(value) ? value : defaultValue;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countEmojis(text: string): number {
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

function getHook(content: string): string {
  // Get first sentence or first line
  const firstLine = content.split('\n')[0];
  const firstSentence = content.split(/[.!?]/)[0];
  return firstLine.length < firstSentence.length ? firstLine : firstSentence;
}

function fallbackAnalysis(content: string): CopyDNAResult {
  const hook = getHook(content);
  const startsWithQuestion = hook.trim().endsWith('?') || hook.includes('?');
  const startsWithNumber = /^\d/.test(hook.trim());
  const hasStory = /\b(eu|minha|meu|meus|minhas)\b/i.test(hook);

  return {
    tone: 'casual',
    hookLength: countWords(hook),
    hookType: startsWithQuestion ? 'question' : startsWithNumber ? 'number' : hasStory ? 'story' : 'statement',
    proofType: 'none',
    ctaStyle: 'direct',
    hasStorytelling: /problema.*solução|antes.*depois|quando.*agora/i.test(content),
    triggers: [],
    wordCount: countWords(content),
    emojiCount: countEmojis(content),
  };
}
