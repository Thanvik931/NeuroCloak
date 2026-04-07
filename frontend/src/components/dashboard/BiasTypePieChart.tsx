import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981'];

export default function BiasTypePieChart({ data = [] }: { data: any[] }) {
  if (!data.length) return <div className="h-[300px] flex items-center justify-center text-slate-500 animate-pulse">Loading chart data...</div>;

  return (
    <div className="h-[300px] w-full mt-6 flex-1">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={6}
            dataKey="count"
            nameKey="type"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ fontWeight: 600 }}
            formatter={(value: any, name: any) => [value, name?.replace(/_/g, ' ').toUpperCase()]}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px', color: '#94a3b8', paddingTop: '20px' }}
            formatter={(value) => value.replace(/_/g, ' ').toUpperCase()}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
