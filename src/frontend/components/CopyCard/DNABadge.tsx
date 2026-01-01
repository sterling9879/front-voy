import {
  MessageCircle,
  Hash,
  Book,
  AlertTriangle,
  Clock,
  Eye,
  Users,
  Award,
  Gift,
  Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { TRIGGER_LABELS, TONE_LABELS, HOOK_TYPE_LABELS } from '@shared/constants';
import type { CopyDNA, Trigger } from '@shared/types';

const TRIGGER_ICONS: Record<string, typeof Zap> = {
  scarcity: AlertTriangle,
  urgency: Clock,
  curiosity: Eye,
  social_proof: Users,
  authority: Award,
  reciprocity: Gift,
  fomo: Zap,
};

interface DNABadgeProps {
  dna: CopyDNA;
  className?: string;
  expanded?: boolean;
}

export default function DNABadge({ dna, className, expanded = false }: DNABadgeProps) {
  if (expanded) {
    return (
      <div className={cn('space-y-3', className)}>
        {/* Tone */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Tom</p>
          <span className="badge bg-gray-100 text-gray-700">
            {TONE_LABELS[dna.tone]}
          </span>
        </div>

        {/* Hook */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Hook</p>
          <div className="flex items-center space-x-2">
            <span className="badge bg-blue-100 text-blue-700">
              {HOOK_TYPE_LABELS[dna.hookType]}
            </span>
            <span className="text-xs text-gray-500">
              {dna.hookLength} palavras
            </span>
          </div>
        </div>

        {/* Storytelling */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Storytelling</p>
          <span
            className={cn(
              'badge',
              dna.hasStorytelling
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            )}
          >
            {dna.hasStorytelling ? 'Sim' : 'Não'}
          </span>
        </div>

        {/* Triggers */}
        {dna.triggers.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Gatilhos</p>
            <div className="flex flex-wrap gap-1">
              {dna.triggers.map((trigger) => {
                const Icon = TRIGGER_ICONS[trigger] || Zap;
                return (
                  <span
                    key={trigger}
                    className="badge bg-purple-100 text-purple-700 flex items-center"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {TRIGGER_LABELS[trigger as Trigger]}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <span>{dna.wordCount} palavras</span>
          <span>{dna.emojiCount} emojis</span>
        </div>
      </div>
    );
  }

  // Compact view
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {/* Hook type icon */}
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-600"
        title={`Hook: ${HOOK_TYPE_LABELS[dna.hookType]}`}
      >
        {dna.hookType === 'question' && <MessageCircle className="w-3 h-3" />}
        {dna.hookType === 'number' && <Hash className="w-3 h-3" />}
        {dna.hookType === 'story' && <Book className="w-3 h-3" />}
        {dna.hookType === 'statement' && <span className="text-xs font-bold">!</span>}
        {dna.hookType === 'challenge' && <span className="text-xs font-bold">?!</span>}
      </span>

      {/* Storytelling indicator */}
      {dna.hasStorytelling && (
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded bg-green-100 text-green-600"
          title="Tem storytelling"
        >
          <Book className="w-3 h-3" />
        </span>
      )}

      {/* Trigger icons (max 3) */}
      {dna.triggers.slice(0, 3).map((trigger) => {
        const Icon = TRIGGER_ICONS[trigger] || Zap;
        return (
          <span
            key={trigger}
            className="inline-flex items-center justify-center w-6 h-6 rounded bg-purple-100 text-purple-600"
            title={TRIGGER_LABELS[trigger as Trigger]}
          >
            <Icon className="w-3 h-3" />
          </span>
        );
      })}

      {dna.triggers.length > 3 && (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-600 text-xs">
          +{dna.triggers.length - 3}
        </span>
      )}
    </div>
  );
}
