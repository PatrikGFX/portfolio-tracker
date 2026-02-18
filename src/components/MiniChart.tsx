"use client";

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniChartProps {
  data: { price: number }[];
  color: string;
}

export default function MiniChart({ data, color }: MiniChartProps) {
  if (data.length < 2) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          animationDuration={500}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
