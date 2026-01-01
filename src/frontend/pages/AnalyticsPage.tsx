import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';
import { analyticsApi } from '../services/api';
import { formatPercentage, formatDate, cn } from '../lib/utils';
import { COPY_STATUS_LABELS, FAILURE_REASONS, TRIGGER_LABELS } from '@shared/constants';
import type { CopyStatus, Trigger } from '@shared/types';

const STATUS_COLORS: Record<CopyStatus, string> = {
  testing: '#3B82F6',
  champion: '#10B981',
  scaling: '#8B5CF6',
  failed: '#EF4444',
  archived: '#6B7280',
};

export default function AnalyticsPage() {
  const { projectId } = useParams<{ projectId: string }>();

  const { data: stats } = useQuery({
    queryKey: ['dashboard', projectId],
    queryFn: () => analyticsApi.dashboard(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  const { data: evolution } = useQuery({
    queryKey: ['evolution', projectId],
    queryFn: () => analyticsApi.evolution(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  const { data: heatmap } = useQuery({
    queryKey: ['heatmap', projectId],
    queryFn: () => analyticsApi.heatmap(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  const { data: insights } = useQuery({
    queryKey: ['insights', projectId],
    queryFn: () => analyticsApi.insights(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  const { data: failureReasons } = useQuery({
    queryKey: ['failure-reasons', projectId],
    queryFn: () => analyticsApi.failureReasons(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  // Prepare pie chart data
  const pieData = stats?.copiesByStatus
    ? Object.entries(stats.copiesByStatus).map(([status, count]) => ({
        name: COPY_STATUS_LABELS[status as CopyStatus],
        value: count as number,
        color: STATUS_COLORS[status as CopyStatus],
      }))
    : [];

  // Prepare heatmap data
  const heatmapFiltered = heatmap?.filter(
    (h: { champion: number; failed: number }) => h.champion > 0 || h.failed > 0
  ) || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">
          Análise detalhada de performance e padrões
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evolution Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução da Taxa de Acerto
          </h2>
          {evolution && evolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatDate(value)}
                  fontSize={12}
                />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taxa de Acerto']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Line
                  type="monotone"
                  dataKey="championRate"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Dados insuficientes para exibir o gráfico
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Status
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Nenhuma copy catalogada ainda
            </div>
          )}
        </div>

        {/* Heatmap */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mapa de Calor de Elementos
          </h2>
          {heatmapFiltered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3">
                      Elemento
                    </th>
                    <th className="text-center text-sm font-medium text-gray-500 pb-3">
                      Campeãs
                    </th>
                    <th className="text-center text-sm font-medium text-gray-500 pb-3">
                      Falharam
                    </th>
                    <th className="text-center text-sm font-medium text-gray-500 pb-3">
                      Diferencial
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {heatmapFiltered.map((item: { element: string; champion: number; failed: number }) => {
                    const diff = item.champion - item.failed;
                    const elementLabel = TRIGGER_LABELS[item.element as Trigger] ||
                      item.element.replace('hook_', 'Hook: ')
                        .replace('cta_', 'CTA: ')
                        .replace('tone_', 'Tom: ')
                        .replace('storytelling', 'Storytelling');

                    return (
                      <tr key={item.element} className="border-t border-gray-100">
                        <td className="py-3 text-sm text-gray-900">
                          {elementLabel}
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={cn(
                              'inline-block px-3 py-1 rounded text-sm font-medium',
                              item.champion > 50
                                ? 'bg-green-100 text-green-700'
                                : item.champion > 25
                                ? 'bg-green-50 text-green-600'
                                : 'bg-gray-50 text-gray-600'
                            )}
                          >
                            {formatPercentage(item.champion)}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={cn(
                              'inline-block px-3 py-1 rounded text-sm font-medium',
                              item.failed > 50
                                ? 'bg-red-100 text-red-700'
                                : item.failed > 25
                                ? 'bg-red-50 text-red-600'
                                : 'bg-gray-50 text-gray-600'
                            )}
                          >
                            {formatPercentage(item.failed)}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span
                            className={cn(
                              'inline-flex items-center text-sm font-medium',
                              diff > 20
                                ? 'text-green-600'
                                : diff < -20
                                ? 'text-red-600'
                                : 'text-gray-500'
                            )}
                          >
                            {diff > 0 ? '+' : ''}
                            {formatPercentage(diff)}
                            {diff > 20 && <TrendingUp className="w-4 h-4 ml-1" />}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">
              Dados insuficientes para exibir o mapa de calor
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Insights da IA
          </h2>
          {insights?.insights && insights.insights.length > 0 ? (
            <div className="space-y-4">
              {insights.insights.map((insight: { pattern: string; evidence: string; action: string }, i: number) => (
                <div
                  key={i}
                  className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100"
                >
                  <p className="font-medium text-gray-900 mb-1">
                    {insight.pattern}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {insight.evidence}
                  </p>
                  <p className="text-sm text-primary-600 font-medium">
                    Ação: {insight.action}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              {insights?.message || 'Insights serão gerados quando houver dados suficientes'}
            </div>
          )}
        </div>

        {/* Failure Reasons */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Motivos de Falha
          </h2>
          {failureReasons && failureReasons.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={failureReasons.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} />
                <YAxis
                  type="category"
                  dataKey="reason"
                  width={150}
                  tickFormatter={(value) =>
                    FAILURE_REASONS.find((r) => r.value === value)?.label.substring(0, 25) ||
                    value.substring(0, 25)
                  }
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Frequência']}
                />
                <Bar dataKey="percentage" fill="#EF4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Nenhum motivo de falha registrado
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
