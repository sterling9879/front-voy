import { useState } from 'react';
import { X, TrendingUp } from 'lucide-react';
import { COPY_STATUS_LABELS } from '@shared/constants';
import type { Copy, CopyStatus } from '@shared/types';

interface MetricsModalProps {
  copy: Copy;
  newStatus: CopyStatus;
  onClose: () => void;
  onSubmit: (metrics: object) => void;
  isLoading: boolean;
}

export default function MetricsModal({
  copy,
  newStatus,
  onClose,
  onSubmit,
  isLoading,
}: MetricsModalProps) {
  const [ctr, setCtr] = useState(copy.ctr?.toString() || '');
  const [roas, setRoas] = useState(copy.roas?.toString() || '');
  const [cpa, setCpa] = useState(copy.cpa?.toString() || '');
  const [spend, setSpend] = useState(copy.spend.toString());
  const [impressions, setImpressions] = useState(copy.impressions.toString());
  const [clicks, setClicks] = useState(copy.clicks.toString());
  const [conversions, setConversions] = useState(copy.conversions.toString());
  const [campaignsCount, setCampaignsCount] = useState(copy.campaignsCount.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const metrics = {
      ctr: ctr ? parseFloat(ctr) : undefined,
      roas: roas ? parseFloat(roas) : undefined,
      cpa: cpa ? parseFloat(cpa) : undefined,
      spend: parseFloat(spend) || 0,
      impressions: parseInt(impressions) || 0,
      clicks: parseInt(clicks) || 0,
      conversions: parseInt(conversions) || 0,
      campaignsCount: parseInt(campaignsCount) || 0,
    };

    onSubmit(metrics);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Métricas para {COPY_STATUS_LABELS[newStatus]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Atualize as métricas desta copy antes de movê-la para{' '}
            <strong>{COPY_STATUS_LABELS[newStatus]}</strong>.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CTR (%)</label>
              <input
                type="number"
                step="0.01"
                value={ctr}
                onChange={(e) => setCtr(e.target.value)}
                className="input"
                placeholder="Ex: 2.5"
              />
            </div>

            <div>
              <label className="label">ROAS</label>
              <input
                type="number"
                step="0.01"
                value={roas}
                onChange={(e) => setRoas(e.target.value)}
                className="input"
                placeholder="Ex: 3.5"
              />
            </div>

            <div>
              <label className="label">CPA (R$)</label>
              <input
                type="number"
                step="0.01"
                value={cpa}
                onChange={(e) => setCpa(e.target.value)}
                className="input"
                placeholder="Ex: 25.00"
              />
            </div>

            <div>
              <label className="label">Gasto Total (R$)</label>
              <input
                type="number"
                step="0.01"
                value={spend}
                onChange={(e) => setSpend(e.target.value)}
                className="input"
                placeholder="Ex: 500.00"
              />
            </div>

            <div>
              <label className="label">Impressões</label>
              <input
                type="number"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
                className="input"
                placeholder="Ex: 10000"
              />
            </div>

            <div>
              <label className="label">Cliques</label>
              <input
                type="number"
                value={clicks}
                onChange={(e) => setClicks(e.target.value)}
                className="input"
                placeholder="Ex: 250"
              />
            </div>

            <div>
              <label className="label">Conversões</label>
              <input
                type="number"
                value={conversions}
                onChange={(e) => setConversions(e.target.value)}
                className="input"
                placeholder="Ex: 20"
              />
            </div>

            <div>
              <label className="label">Nº de Campanhas</label>
              <input
                type="number"
                value={campaignsCount}
                onChange={(e) => setCampaignsCount(e.target.value)}
                className="input"
                placeholder="Ex: 3"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar e Mover'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
