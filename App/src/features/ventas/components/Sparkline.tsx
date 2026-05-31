import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: { day: string; valor: number }[];
  color?: string;
}

export function Sparkline({ data, color = '#0073e6' }: SparklineProps) {
  if (!data.length) return null;

  const gradId = `sg-${color.replace('#', '')}`;

  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="valor"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
