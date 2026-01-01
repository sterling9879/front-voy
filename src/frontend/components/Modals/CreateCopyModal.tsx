import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { copiesApi, hypothesesApi } from '../../services/api';
import { CREATIVE_TYPE_LABELS, AUDIENCE_TEMPERATURE_LABELS } from '@shared/constants';

interface CreateCopyModalProps {
  projectId: string;
  onClose: () => void;
}

export default function CreateCopyModal({ projectId, onClose }: CreateCopyModalProps) {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creativeUrl, setCreativeUrl] = useState('');
  const [creativeType, setCreativeType] = useState('');
  const [audienceTemperature, setAudienceTemperature] = useState('');
  const [hypothesisId, setHypothesisId] = useState('');
  const [hypothesisVariable, setHypothesisVariable] = useState('');

  const { data: hypotheses } = useQuery({
    queryKey: ['hypotheses', projectId],
    queryFn: () => hypothesesApi.list(projectId).then((res) => res.data),
  });

  const activeHypotheses = hypotheses?.filter((h: { status: string }) => h.status === 'active') || [];

  const createMutation = useMutation({
    mutationFn: (data: {
      projectId: string;
      title: string;
      content: string;
      creativeUrl?: string;
      creativeType?: string;
      audienceSegment?: object;
      hypothesisId?: string;
      hypothesisVariable?: string;
    }) => copiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['copies', projectId] });
      toast.success('Copy criada com sucesso!');
      onClose();
    },
    onError: () => {
      toast.error('Erro ao criar copy');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: {
      projectId: string;
      title: string;
      content: string;
      creativeUrl?: string;
      creativeType?: string;
      audienceSegment?: { temperature: 'cold' | 'warm' | 'hot' };
      hypothesisId?: string;
      hypothesisVariable?: string;
    } = {
      projectId,
      title,
      content,
    };

    if (creativeUrl) data.creativeUrl = creativeUrl;
    if (creativeType) data.creativeType = creativeType;
    if (audienceTemperature) {
      data.audienceSegment = { temperature: audienceTemperature as 'cold' | 'warm' | 'hot' };
    }
    if (hypothesisId) {
      data.hypothesisId = hypothesisId;
      data.hypothesisVariable = hypothesisVariable;
    }

    createMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Nova Copy</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Ex: Headline Principal v1"
              required
            />
          </div>

          <div>
            <label className="label">Conteúdo da Copy</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input"
              rows={8}
              placeholder="Cole aqui o texto completo da sua copy..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Criativo (opcional)</label>
              <select
                value={creativeType}
                onChange={(e) => setCreativeType(e.target.value)}
                className="input"
              >
                <option value="">Selecione</option>
                {Object.entries(CREATIVE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Temperatura da Audiência (opcional)</label>
              <select
                value={audienceTemperature}
                onChange={(e) => setAudienceTemperature(e.target.value)}
                className="input"
              >
                <option value="">Selecione</option>
                {Object.entries(AUDIENCE_TEMPERATURE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">URL do Criativo (opcional)</label>
            <input
              type="url"
              value={creativeUrl}
              onChange={(e) => setCreativeUrl(e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </div>

          {activeHypotheses.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hipótese (opcional)</label>
                <select
                  value={hypothesisId}
                  onChange={(e) => setHypothesisId(e.target.value)}
                  className="input"
                >
                  <option value="">Nenhuma</option>
                  {activeHypotheses.map((h: { id: string; name: string }) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {hypothesisId && (
                <div>
                  <label className="label">Variável</label>
                  <select
                    value={hypothesisVariable}
                    onChange={(e) => setHypothesisVariable(e.target.value)}
                    className="input"
                    required={!!hypothesisId}
                  >
                    <option value="">Selecione</option>
                    <option value="A">Variável A</option>
                    <option value="B">Variável B</option>
                  </select>
                </div>
              )}
            </div>
          )}

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
              {createMutation.isPending ? 'Criando...' : 'Criar Copy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
