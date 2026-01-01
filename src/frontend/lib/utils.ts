import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getHookPreview(content: string, maxLength = 80): string {
  const firstLine = content.split('\n')[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength) + '...';
}

export function getConfidenceLevel(score: number): {
  level: 'low' | 'medium' | 'high';
  label: string;
  color: string;
  bgColor: string;
} {
  if (score <= 30) {
    return {
      level: 'low',
      label: 'Baixa',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    };
  }
  if (score <= 60) {
    return {
      level: 'medium',
      label: 'Média',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    };
  }
  return {
    level: 'high',
    label: 'Alta',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  };
}
