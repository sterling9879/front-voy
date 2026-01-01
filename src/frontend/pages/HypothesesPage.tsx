import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  FlaskConical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { hypothesesApi } from '../services/api';
import { formatDate, cn } from '../lib/utils';
import type { Hypothesis } from '@shared/types';

export default function HypothesesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>(null);
  const [showConcludeModal, setShowConcludeModal] = useState(false);

  const { data: hypotheses = [], isLoading } = useQuery({
    queryKey: ['hypotheses', projectId],
    queryFn: () => hypothesesApi.list(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hypothesesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses', projectId] });
      toast.success('Hipótese excluída');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta hipótese?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Laboratório de Hipóteses</h1>
          <p className="text-gray-500 mt-1">
            Crie e gerencie testes A/B para validar suas teorias
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Hipótese
        </button>
      </div>

      {hypotheses.length === 0 ? (
        <div className="text-center py-12">
          <FlaskConical className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Nenhuma hipótese
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando sua primeira hipótese de teste
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Hipótese
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {hypotheses.map((hypothesis: Hypothesis & { stats?: { variableA: { count: number; avgRoas: number }; variableB: { count: number; avgRoas: number } } }) => (
            <div
              key={hypothesis.id}
              className="card p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(hypothesis.status)}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {hypothesis.name}
                    </h3>
                    {hypothesis.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {hypothesis.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={cn(
                      'badge',
                      hypothesis.status === 'active'
                        ? 'bg-blue-100 text-blue-700'
                        : hypothesis.status === 'concluded'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {hypothesis.status === 'active'
                      ? 'Ativa'
                      : hypothesis.status === 'concluded'
                      ? 'Concluída'
                      : 'Cancelada'}
                  </span>
                  {hypothesis.status === 'active' && (
                    <button
                      onClick={() => {
                        setSelectedHypothesis(hypothesis.id);
                        setShowConcludeModal(true);
                      }}
                      className="btn-primary text-sm"
                    >
                      Concluir
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(hypothesis.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Variables */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900">Variável A</span>
                    <span className="text-sm text-blue-600">
                      {hypothesis.stats?.variableA.count || 0} copies
                    </span>
                  </div>
                  <p className="text-sm text-blue-800">{hypothesis.variableA}</p>
                  {hypothesis.stats?.variableA.avgRoas > 0 && (
                    <p className="text-lg font-bold text-blue-900 mt-2">
                      {hypothesis.stats.variableA.avgRoas.toFixed(2)}x ROAS
                    </p>
                  )}
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-900">Variável B</span>
                    <span className="text-sm text-purple-600">
                      {hypothesis.stats?.variableB.count || 0} copies
                    </span>
                  </div>
                  <p className="text-sm text-purple-800">{hypothesis.variableB}</p>
                  {hypothesis.stats?.variableB.avgRoas > 0 && (
                    <p className="text-lg font-bold text-purple-900 mt-2">
                      {hypothesis.stats.variableB.avgRoas.toFixed(2)}x ROAS
                    </p>
                  )}
                </div>
              </div>

              {/* Conclusion */}
              {hypothesis.status === 'concluded' && hypothesis.conclusion && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">Conclusão:</p>
                  <p className="text-sm text-green-800 mt-1">{hypothesis.conclusion}</p>
                  {hypothesis.winningVariable && (
                    <p className="text-sm font-medium text-green-700 mt-2">
                      Vencedora: Variável {hypothesis.winningVariable}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500">
                Criada em {formatDate(hypothesis.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateHypothesisModal
          projectId={projectId!}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Conclude Modal */}
      {showConcludeModal && selectedHypothesis && (
        <ConcludeHypothesisModal
          hypothesisId={selectedHypothesis}
          projectId={projectId!}
          onClose={() => {
            setShowConcludeModal(false);
            setSelectedHypothesis(null);
          }}
        />
      )}
    </div>
  );
}

function CreateHypothesisModal({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variableA, setVariableA] = useState('');
  const [variableB, setVariableB] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: {
      projectId: string;
      name: string;
      description?: string;
      variableA: string;
      variableB: string;
    }) => hypothesesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses', projectId] });
      toast.success('Hipótese criada');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao criar hipótese');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      projectId,
      name,
      description: description || undefined,
      variableA,
      variableB,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Nova Hipótese
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome da hipótese</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Ex: Headline com pergunta vs afirmação"
                required
              />
            </div>
            <div>
              <label className="label">Descrição (opcional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                rows={2}
                placeholder="Descreva o objetivo do teste..."
              />
            </div>
            <div>
              <label className="label">Variável A</label>
              <input
                type="text"
                value={variableA}
                onChange={(e) => setVariableA(e.target.value)}
                className="input"
                placeholder="Ex: Headline com pergunta"
                required
              />
            </div>
            <div>
              <label className="label">Variável B</label>
              <input
                type="text"
                value={variableB}
                onChange={(e) => setVariableB(e.target.value)}
                className="input"
                placeholder="Ex: Headline com afirmação"
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={createMutation.isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Criando...' : 'Criar Hipótese'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ConcludeHypothesisModal({
  hypothesisId,
  projectId,
  onClose,
}: {
  hypothesisId: string;
  projectId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [conclusion, setConclusion] = useState('');
  const [winningVariable, setWinningVariable] = useState<'A' | 'B' | 'inconclusive'>('A');

  const concludeMutation = useMutation({
    mutationFn: (data: { conclusion: string; winningVariable: string }) =>
      hypothesesApi.conclude(hypothesisId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hypotheses', projectId] });
      toast.success('Hipótese concluída');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao concluir hipótese');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    concludeMutation.mutate({ conclusion, winningVariable });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Concluir Hipótese
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Variável Vencedora</label>
              <div className="flex space-x-4">
                {['A', 'B', 'inconclusive'].map((v) => (
                  <label
                    key={v}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 cursor-pointer text-center',
                      winningVariable === v
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="winner"
                      value={v}
                      checked={winningVariable === v}
                      onChange={(e) => setWinningVariable(e.target.value as 'A' | 'B' | 'inconclusive')}
                      className="sr-only"
                    />
                    <span className="font-medium">
                      {v === 'inconclusive' ? 'Inconclusivo' : `Variável ${v}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Conclusão</label>
              <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="input"
                rows={4}
                placeholder="Descreva as conclusões do teste..."
                required
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={concludeMutation.isPending}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={concludeMutation.isPending}
              >
                {concludeMutation.isPending ? 'Salvando...' : 'Concluir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
