import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Clock, History, Edit2, Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { copiesApi } from '../../services/api';
import ConfidenceBadge from '../CopyCard/ConfidenceBadge';
import DNABadge from '../CopyCard/DNABadge';
import { formatDateTime, formatCurrency, cn } from '../../lib/utils';
import { COPY_STATUS_LABELS, COPY_STATUS_COLORS } from '@shared/constants';
import type { CopyVersion } from '@shared/types';

interface CopyDetailModalProps {
  copyId: string;
  projectId: string;
  onClose: () => void;
}

export default function CopyDetailModal({
  copyId,
  projectId,
  onClose,
}: CopyDetailModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'versions'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const { data: copy, isLoading } = useQuery({
    queryKey: ['copy', copyId],
    queryFn: () => copiesApi.get(copyId).then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (content: string) => copiesApi.update(copyId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copy', copyId] });
      queryClient.invalidateQueries({ queryKey: ['copies', projectId] });
      setIsEditing(false);
      toast.success('Copy atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar copy');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) =>
      copiesApi.restoreVersion(copyId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copy', copyId] });
      queryClient.invalidateQueries({ queryKey: ['copies', projectId] });
      toast.success('Versão restaurada');
    },
    onError: () => {
      toast.error('Erro ao restaurar versão');
    },
  });

  const handleStartEdit = () => {
    setEditedContent(copy?.content || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateMutation.mutate(editedContent);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!copy) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">{copy.title}</h2>
            <span
              className={cn(
                'badge',
                COPY_STATUS_COLORS[copy.status]
              )}
            >
              {COPY_STATUS_LABELS[copy.status]}
            </span>
            {copy.confidenceScore !== undefined && (
              <ConfidenceBadge score={copy.confidenceScore} />
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px',
              activeTab === 'details'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            Detalhes
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px flex items-center',
              activeTab === 'versions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            <History className="w-4 h-4 mr-1" />
            Histórico ({copy.versions?.length || 0})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Conteúdo</label>
                  {!isEditing && (
                    <button
                      onClick={handleStartEdit}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="input"
                      rows={10}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary text-sm"
                        disabled={updateMutation.isPending}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="btn-primary text-sm"
                        disabled={updateMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700">
                    {copy.content}
                  </div>
                )}
              </div>

              {/* DNA */}
              {copy.dna && (
                <div>
                  <label className="label">DNA da Copy</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <DNABadge dna={copy.dna} expanded />
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div>
                <label className="label">Métricas</label>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {copy.roas?.toFixed(2) || '-'}x
                    </p>
                    <p className="text-xs text-gray-500">ROAS</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {copy.ctr?.toFixed(2) || '-'}%
                    </p>
                    <p className="text-xs text-gray-500">CTR</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(copy.spend)}
                    </p>
                    <p className="text-xs text-gray-500">Gasto</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {copy.conversions}
                    </p>
                    <p className="text-xs text-gray-500">Conversões</p>
                  </div>
                </div>
              </div>

              {/* Failure Reason */}
              {copy.failureReason && (
                <div>
                  <label className="label">Motivos da Falha</label>
                  <div className="bg-red-50 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                      {copy.failureReason.reasons.map((reason: string, i: number) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                    {copy.failureReason.notes && (
                      <p className="mt-2 text-sm text-gray-600">
                        <strong>Notas:</strong> {copy.failureReason.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Info */}
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Criada em {formatDateTime(copy.createdAt)}
                </span>
                <span>Versão {copy.version}</span>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-4">
              {(!copy.versions || copy.versions.length === 0) ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum histórico de versões ainda.
                </p>
              ) : (
                copy.versions.map((version: CopyVersion) => (
                  <div
                    key={version.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          Versão {version.versionNumber}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(version.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={() => restoreMutation.mutate(version.id)}
                        disabled={restoreMutation.isPending}
                        className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restaurar
                      </button>
                    </div>
                    {version.changeDescription && (
                      <p className="text-sm text-gray-500 mb-2">
                        {version.changeDescription}
                      </p>
                    )}
                    <div className="bg-gray-50 rounded p-3 text-sm text-gray-700 line-clamp-3">
                      {version.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
