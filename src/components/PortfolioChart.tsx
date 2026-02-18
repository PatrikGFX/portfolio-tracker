"use client";

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/types';

interface PortfolioChartProps {
  data: { date: string; value: number; invested: number }[];
}

const TIME_RANGES = [
  { label: '1T', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: 'Vše', days: 9999 },
];

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const [activeRange, setActiveRange] = useState(2);
  const [showInvested, setShowInvested] = useState(true);

  const filteredData = data.slice(-TIME_RANGES[activeRange].days);

  if (filteredData.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Vývoj portfolia</h3>
        <div className="h-[300px] flex items-center justify-center text-gray-300">
          Přidejte akcie pro zobrazení grafu
        </div>
      </div>
    );
  }

  const minValue = Math.min(...filteredData.map(d => Math.min(d.value, d.invested))) * 0.98;
  const maxValue = Math.max(...filteredData.map(d => Math.max(d.value, d.invested))) * 1.02;
  const lastValue = filteredData[filteredData.length - 1]?.value || 0;
  const firstValue = filteredData[0]?.value || 0;
  const isPositive = lastValue >= firstValue;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
        <p className="text-xs text-gray-400 font-mono mb-1">
          {new Date(label).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <p className="text-sm font-semibold text-gray-900">
          {formatCurrency(payload[0]?.value, 'USD')}
        </p>
        {payload[1] && showInvested && (
          <p className="text-sm text-violet-500">
            Inv: {formatCurrency(payload[1]?.value, 'USD')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Vývoj portfolia</h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {isPositive ? '↑' : '↓'}{' '}
            <span className={isPositive ? 'text-emerald-600' : 'text-red-500'}>
              {isPositive ? '+' : ''}{formatCurrency(lastValue - firstValue, 'USD')}
            </span>
            {' '}za období
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvested(!showInvested)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all border ${
              showInvested
                ? 'bg-violet-50 text-violet-600 border-violet-200'
                : 'bg-gray-50 text-gray-400 border-gray-200'
            }`}
          >
            Investice
          </button>
          <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
            {TIME_RANGES.map((range, i) => (
              <button
                key={range.label}
                onClick={() => setActiveRange(i)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                  activeRange === i
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="gradientValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.15} />
                <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => new Date(val).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' })}
              stroke="#e5e7ef"
              tick={{ fontSize: 11, fill: '#9298ad' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minValue, maxValue]}
              tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
              stroke="#e5e7ef"
              tick={{ fontSize: 11, fill: '#9298ad' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {showInvested && (
              <Area
                type="monotone"
                dataKey="invested"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                fill="url(#gradientInvested)"
                animationDuration={1200}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2.5}
              fill="url(#gradientValue)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
