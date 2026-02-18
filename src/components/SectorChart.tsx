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
      <div className="card p-6 h-full">
        <h3 className="text-base font-semibold text-gray-800 mb-4">Sektorové rozložení</h3>
        <div className="h-[250px] flex items-center justify-center text-gray-300">
          Žádná data k zobrazení
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
        <p className="text-sm font-semibold text-gray-800">
          {d.icon} {d.name}
        </p>
        <p className="text-xs text-gray-400 font-mono mt-1">
          {formatCurrency(d.value, 'USD')} ({d.percent.toFixed(1)}%)
        </p>
      </div>
    );
  };

  return (
    <div className="card p-6 h-full animate-fade-in">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Sektorové rozložení</h3>

      <div className="flex flex-col items-center gap-5">
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
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-400">Celkem</span>
            <span className="text-sm font-bold text-gray-700">{chartData.length} sektorů</span>
          </div>
        </div>

        <div className="w-full space-y-1.5">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600 flex-1 truncate">
                {item.icon} {item.name}
              </span>
              <span className="text-sm font-mono text-gray-800 tabular-nums font-medium">
                {item.percent.toFixed(1)}%
              </span>
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
