import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  FileText,
  Calendar,
  Filter
} from 'lucide-react';
import { timelineApi } from '../services/api';
import { formatDateTime, cn } from '../lib/utils';
import { COPY_STATUS_LABELS, COPY_STATUS_COLORS } from '@shared/constants';
import type { CopyStatus } from '@shared/types';

export default function TimelinePage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: timeline = [], isLoading } = useQuery({
    queryKey: ['timeline', projectId],
    queryFn: () => timelineApi.list(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
          <p className="text-gray-500 mt-1">
            Histórico de mudanças de status das copies
          </p>
        </div>
        <button className="btn-secondary">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </button>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhum evento registrado
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Mudanças de status aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {timeline.map((event: {
              id: string;
              copyId: string;
              fromStatus: CopyStatus;
              toStatus: CopyStatus;
              metrics?: { roas?: number; spend?: number };
              createdAt: string;
              timeInPreviousStatus?: string;
              copy: { id: string; title: string; content: string };
            }) => (
              <div key={event.id} className="relative pl-10">
                {/* Dot */}
                <div
                  className={cn(
                    'absolute left-2.5 w-3 h-3 rounded-full border-2 border-white',
                    event.toStatus === 'champion' || event.toStatus === 'scaling'
                      ? 'bg-green-500'
                      : event.toStatus === 'failed'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  )}
                />

                <div className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {event.copy.title}
                        </h4>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {event.copy.content.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center space-x-2">
                    <span
                      className={cn(
                        'badge',
                        COPY_STATUS_COLORS[event.fromStatus]
                      )}
                    >
                      {COPY_STATUS_LABELS[event.fromStatus]}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span
                      className={cn(
                        'badge',
                        COPY_STATUS_COLORS[event.toStatus]
                      )}
                    >
                      {COPY_STATUS_LABELS[event.toStatus]}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    {event.timeInPreviousStatus && (
                      <span>
                        Ficou {event.timeInPreviousStatus} em {COPY_STATUS_LABELS[event.fromStatus]}
                      </span>
                    )}
                    {event.metrics?.roas && (
                      <span>ROAS: {event.metrics.roas.toFixed(2)}x</span>
                    )}
                    {event.metrics?.spend && (
                      <span>Gasto: R$ {event.metrics.spend.toFixed(0)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
