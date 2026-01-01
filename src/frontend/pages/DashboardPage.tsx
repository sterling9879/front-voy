import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Target,
  FileText,
  ArrowRight
} from 'lucide-react';
import { analyticsApi, projectsApi } from '../services/api';
import { useProjectStore } from '../stores/project.store';
import { formatPercentage, formatNumber, cn } from '../lib/utils';
import { useEffect } from 'react';
import { COPY_STATUS_LABELS } from '@shared/constants';
import type { CopyStatus } from '@shared/types';

export default function DashboardPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { currentProject, setCurrentProject } = useProjectStore();

  // Fetch project if not in store
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId!).then((res) => res.data),
    enabled: !!projectId && !currentProject,
  });

  useEffect(() => {
    if (project && !currentProject) {
      setCurrentProject(project);
    }
  }, [project, currentProject, setCurrentProject]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', projectId],
    queryFn: () => analyticsApi.dashboard(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  const { data: benchmark } = useQuery({
    queryKey: ['benchmark', projectId],
    queryFn: () => analyticsApi.benchmark(projectId!).then((res) => res.data),
    enabled: !!projectId,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const evolutionPositive = stats?.evolutionPercentage >= 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-gray-500 mt-1">
            Resumo de performance do projeto
          </p>
        </div>
        <button
          onClick={() => navigate(`/projects/${projectId}/board`)}
          className="btn-primary"
        >
          Ir para Board
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Taxa de Acerto</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPercentage(stats?.championRate || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {evolutionPositive ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                evolutionPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {evolutionPositive ? '+' : ''}
              {formatPercentage(stats?.evolutionPercentage || 0)}
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Taxa (30 dias)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatPercentage(stats?.championRateLast30Days || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Últimos 30 dias de testes
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">ROAS Médio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatNumber(stats?.avgChampionRoas || 0, 2)}x
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Média das copies campeãs
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Copies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalCopies || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Copies catalogadas
            </span>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      {benchmark && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Comparativo com Nicho
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Sua Taxa de Acerto</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(benchmark.userStats.championRate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Média do Nicho</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(benchmark.benchmark.avgChampionRate)}
              </p>
              {benchmark.userStats.championRate > benchmark.benchmark.avgChampionRate ? (
                <span className="text-sm text-green-600">Acima da média</span>
              ) : (
                <span className="text-sm text-yellow-600">Abaixo da média</span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Top 10% do Nicho</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(benchmark.benchmark.topPercentileRoas, 1)}x ROAS
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Distribution by Status */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Distribuição por Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats?.copiesByStatus &&
            (Object.entries(stats.copiesByStatus) as [CopyStatus, number][]).map(([status, count]) => (
              <div
                key={status}
                className="text-center p-4 rounded-lg bg-gray-50"
              >
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {COPY_STATUS_LABELS[status]}
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
