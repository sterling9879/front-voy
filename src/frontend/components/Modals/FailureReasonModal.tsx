import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { FAILURE_REASONS } from '@shared/constants';

interface FailureReasonModalProps {
  onClose: () => void;
  onSubmit: (reasons: string[], notes: string) => void;
  isLoading: boolean;
}

export default function FailureReasonModal({
  onClose,
  onSubmit,
  isLoading,
}: FailureReasonModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const toggleReason = (value: string) => {
    setSelectedReasons((prev) =>
      prev.includes(value)
        ? prev.filter((r) => r !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedReasons.length === 0) {
      return;
    }

    let reasons = [...selectedReasons];
    if (selectedReasons.includes('other') && otherReason) {
      reasons = reasons.filter((r) => r !== 'other');
      reasons.push(`Outro: ${otherReason}`);
    }

    onSubmit(reasons, notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">
              Por que esta copy falhou?
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
            Selecione os motivos que levaram esta copy a não performar.
            Esses dados ajudam a melhorar suas próximas copies.
          </p>

          <div className="space-y-2 mb-4">
            {FAILURE_REASONS.map((reason) => (
              <label
                key={reason.value}
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason.value)}
                  onChange={() => toggleReason(reason.value)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700">{reason.label}</span>
              </label>
            ))}
          </div>

          {selectedReasons.includes('other') && (
            <div className="mb-4">
              <label className="label">Especifique o motivo</label>
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                className="input"
                placeholder="Descreva o motivo..."
              />
            </div>
          )}

          <div className="mb-4">
            <label className="label">Observações adicionais (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows={3}
              placeholder="Alguma observação extra sobre este teste..."
            />
          </div>

          <div className="flex justify-end space-x-3">
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
              className="btn-danger"
              disabled={isLoading || selectedReasons.length === 0}
            >
              {isLoading ? 'Salvando...' : 'Marcar como Falhou'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
