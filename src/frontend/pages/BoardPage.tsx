import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { copiesApi } from '../services/api';
import CopyCard from '../components/CopyCard/CopyCard';
import CreateCopyModal from '../components/Modals/CreateCopyModal';
import FailureReasonModal from '../components/Modals/FailureReasonModal';
import MetricsModal from '../components/Modals/MetricsModal';
import { COPY_STATUS_LABELS, COPY_STATUS_ORDER } from '@shared/constants';
import type { Copy, CopyStatus } from '@shared/types';
import { cn } from '../lib/utils';

const COLUMN_COLORS: Record<CopyStatus, string> = {
  testing: 'border-t-blue-500',
  champion: 'border-t-green-500',
  scaling: 'border-t-purple-500',
  failed: 'border-t-red-500',
  archived: 'border-t-gray-400',
};

export default function BoardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [failureModalCopy, setFailureModalCopy] = useState<Copy | null>(null);
  const [metricsModalData, setMetricsModalData] = useState<{
    copy: Copy;
    newStatus: CopyStatus;
  } | null>(null);

  const { data: copies = [], isLoading } = useQuery({
    queryKey: ['copies', projectId],
    queryFn: () => copiesApi.list(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      copyId,
      data,
    }: {
      copyId: string;
      data: {
        status: CopyStatus;
        metrics?: object;
        failureReasons?: string[];
        failureNotes?: string;
      };
    }) => copiesApi.updateStatus(copyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies', projectId] });
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceStatus = result.source.droppableId as CopyStatus;
    const destStatus = result.destination.droppableId as CopyStatus;

    if (sourceStatus === destStatus) return;

    const copy = copies.find((c: Copy) => c.id === result.draggableId);
    if (!copy) return;

    // If moving to failed, show failure reason modal
    if (destStatus === 'failed') {
      setFailureModalCopy({ ...copy, status: destStatus });
      return;
    }

    // If moving to champion/scaling, require metrics
    if (destStatus === 'champion' || destStatus === 'scaling') {
      setMetricsModalData({ copy, newStatus: destStatus });
      return;
    }

    // Otherwise, update directly
    updateStatusMutation.mutate({
      copyId: copy.id,
      data: { status: destStatus },
    });
  };

  const handleFailureSubmit = (reasons: string[], notes: string) => {
    if (!failureModalCopy) return;

    updateStatusMutation.mutate(
      {
        copyId: failureModalCopy.id,
        data: {
          status: 'failed',
          failureReasons: reasons,
          failureNotes: notes,
        },
      },
      {
        onSuccess: () => {
          setFailureModalCopy(null);
          toast.success('Status atualizado');
        },
      }
    );
  };

  const handleMetricsSubmit = (metrics: object) => {
    if (!metricsModalData) return;

    updateStatusMutation.mutate(
      {
        copyId: metricsModalData.copy.id,
        data: {
          status: metricsModalData.newStatus,
          metrics,
        },
      },
      {
        onSuccess: () => {
          setMetricsModalData(null);
          toast.success('Status atualizado');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const groupedCopies = COPY_STATUS_ORDER.reduce((acc, status) => {
    acc[status] = copies.filter((c: Copy) => c.status === status);
    return acc;
  }, {} as Record<CopyStatus, Copy[]>);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Board de Copies</h1>
            <p className="text-gray-500 mt-1">
              Arraste as copies entre colunas para atualizar o status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn-secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Copy
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-6 bg-gray-50">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max">
            {COPY_STATUS_ORDER.map((status) => (
              <div
                key={status}
                className={cn(
                  'w-80 flex flex-col bg-gray-100 rounded-lg border-t-4',
                  COLUMN_COLORS[status]
                )}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">
                      {COPY_STATUS_LABELS[status]}
                    </h3>
                    <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-600">
                      {groupedCopies[status]?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin',
                        snapshot.isDraggingOver && 'bg-gray-200'
                      )}
                    >
                      {groupedCopies[status]?.map((copy: Copy, index: number) => (
                        <Draggable
                          key={copy.id}
                          draggableId={copy.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                snapshot.isDragging && 'rotate-2 shadow-lg'
                              )}
                            >
                              <CopyCard copy={copy} projectId={projectId!} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCopyModal
          projectId={projectId!}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {failureModalCopy && (
        <FailureReasonModal
          onClose={() => setFailureModalCopy(null)}
          onSubmit={handleFailureSubmit}
          isLoading={updateStatusMutation.isPending}
        />
      )}

      {metricsModalData && (
        <MetricsModal
          copy={metricsModalData.copy}
          newStatus={metricsModalData.newStatus}
          onClose={() => setMetricsModalData(null)}
          onSubmit={handleMetricsSubmit}
          isLoading={updateStatusMutation.isPending}
        />
      )}
    </div>
  );
}
