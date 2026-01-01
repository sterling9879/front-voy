import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Image,
  Target,
  Eye,
  MoreVertical,
  Trash2,
  Edit2
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { copiesApi } from '../../services/api';
import ConfidenceBadge from './ConfidenceBadge';
import DNABadge from './DNABadge';
import CopyDetailModal from '../Modals/CopyDetailModal';
import { getHookPreview, cn } from '../../lib/utils';
import { CREATIVE_TYPE_LABELS } from '@shared/constants';
import type { Copy } from '@shared/types';

interface CopyCardProps {
  copy: Copy;
  projectId: string;
}

export default function CopyCard({ copy, projectId }: CopyCardProps) {
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => copiesApi.delete(copy.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies', projectId] });
      toast.success('Copy excluída');
    },
    onError: () => {
      toast.error('Erro ao excluir copy');
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta copy?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowDetail(true)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm line-clamp-1 flex-1">
            {copy.title}
          </h4>
          <div className="relative ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetail(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalhes
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hook preview */}
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {getHookPreview(copy.content, 100)}
        </p>

        {/* DNA Badge */}
        {copy.dna && <DNABadge dna={copy.dna} className="mb-3" />}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {copy.confidenceScore !== undefined && (
              <ConfidenceBadge score={copy.confidenceScore} />
            )}
            {copy.creativeType && (
              <span className="text-xs text-gray-500 flex items-center">
                <Image className="w-3 h-3 mr-1" />
                {CREATIVE_TYPE_LABELS[copy.creativeType]}
              </span>
            )}
          </div>
          {copy.roas && (
            <span className="text-xs font-medium text-green-600">
              {copy.roas.toFixed(2)}x ROAS
            </span>
          )}
        </div>

        {/* Metrics row */}
        {(copy.spend > 0 || copy.campaignsCount > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{copy.campaignsCount} campanhas</span>
            <span>R$ {copy.spend.toFixed(0)}</span>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && (
        <CopyDetailModal
          copyId={copy.id}
          projectId={projectId}
          onClose={() => setShowDetail(false)}
        />
      )}
    </>
  );
}
