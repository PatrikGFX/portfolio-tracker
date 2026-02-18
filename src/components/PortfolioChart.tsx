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
  ReferenceLine,
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
  const [activeRange, setActiveRange] = useState(2); // 3M default
  const [showInvested, setShowInvested] = useState(true);

  const filteredData = data.slice(-TIME_RANGES[activeRange].days);

  if (filteredData.length === 0) {
    return (
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-display font-semibold text-white/80 mb-4">
          Vývoj portfolia
        </h3>
        <div className="h-[300px] flex items-center justify-center text-white/30 font-body">
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
      <div className="glass rounded-xl p-3 shadow-xl border border-white/10">
        <p className="text-xs text-white/40 font-mono mb-1">
          {new Date(label).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
        <p className="text-sm font-semibold text-emerald-400 font-display">
          {formatCurrency(payload[0]?.value, 'USD')}
        </p>
        {payload[1] && showInvested && (
          <p className="text-sm text-violet-400/70 font-display">
            Inv: {formatCurrency(payload[1]?.value, 'USD')}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-white/80">
            Vývoj portfolia
          </h3>
          <p className="text-sm text-white/30 font-body mt-1">
            {isPositive ? '📈' : '📉'} {isPositive ? '+' : ''}
            {formatCurrency(lastValue - firstValue, 'USD')} za období
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvested(!showInvested)}
            className={`
              text-xs font-mono px-3 py-1.5 rounded-lg transition-all
              ${showInvested
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                : 'bg-white/5 text-white/30 border border-white/10'
              }
            `}
          >
            Investice
          </button>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {TIME_RANGES.map((range, i) => (
              <button
                key={range.label}
                onClick={() => setActiveRange(i)}
                className={`
                  text-xs font-mono px-3 py-1.5 rounded-lg transition-all
                  ${activeRange === i
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-white/30 hover:text-white/50'
                  }
                `}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="gradientValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? '#34d399' : '#fb7185'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={isPositive ? '#34d399' : '#fb7185'} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradientInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
              }}
              stroke="rgba(255,255,255,0.15)"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[minValue, maxValue]}
              tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
              stroke="rgba(255,255,255,0.15)"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            {showInvested && (
              <Area
                type="monotone"
                dataKey="invested"
                stroke="#a78bfa"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                fill="url(#gradientInvested)"
                animationDuration={1200}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#34d399' : '#fb7185'}
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
