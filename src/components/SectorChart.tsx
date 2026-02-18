"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SECTORS, formatCurrency } from '@/lib/types';

interface SectorChartProps {
  data: { sector: string; value: number }[];
}

export default function SectorChart({ data }: SectorChartProps) {
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  const chartData = data
    .map(d => ({
      name: SECTORS[d.sector]?.label || d.sector,
      value: Math.round(d.value * 100) / 100,
      color: SECTORS[d.sector]?.color || '#94a3b8',
      icon: SECTORS[d.sector]?.icon || '📊',
      percent: totalValue > 0 ? (d.value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 h-full">
        <h3 className="text-lg font-display font-semibold text-white/80 mb-4">
          Sektorové rozložení
        </h3>
        <div className="h-[250px] flex items-center justify-center text-white/30 font-body">
          Žádná data k zobrazení
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="glass rounded-xl p-3 shadow-xl border border-white/10">
        <p className="text-sm font-semibold text-white font-display">
          {d.icon} {d.name}
        </p>
        <p className="text-xs text-white/50 font-mono mt-1">
          {formatCurrency(d.value, 'USD')} ({d.percent.toFixed(1)}%)
        </p>
      </div>
    );
  };

  return (
    <div className="glass rounded-2xl p-6 h-full animate-fade-in">
      <h3 className="text-lg font-display font-semibold text-white/80 mb-4">
        Sektorové rozložení
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Pie chart */}
        <div className="w-[200px] h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                animationBegin={200}
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="transparent"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-white/30 font-body">Celkem</span>
            <span className="text-sm font-bold text-white font-display">
              {chartData.length} sektory
            </span>
          </div>
        </div>

        {/* Legend / breakdown */}
        <div className="flex-1 space-y-2 w-full">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-white/60 font-body flex-1 truncate">
                {item.icon} {item.name}
              </span>
              <span className="text-sm font-mono text-white/80 tabular-nums">
                {item.percent.toFixed(1)}%
              </span>
              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
