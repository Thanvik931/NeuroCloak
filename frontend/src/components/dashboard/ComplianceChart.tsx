import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ComplianceChart({ data = [] }: { data: any[] }) {
  if (!data.length) return <div className="h-[300px] flex items-center justify-center text-slate-500 animate-pulse">Loading chart data...</div>;

  return (
    <div className="h-[300px] w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            tickMargin={12}
            minTickGap={20}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
            domain={[0, 1]} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
            itemStyle={{ color: '#3B82F6', fontWeight: 600 }}
            labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}
            formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Compliance Rate']}
            labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
            cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line 
            type="monotone" 
            dataKey="complianceRate" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#2563EB', stroke: '#0F172A', strokeWidth: 2, className: 'animate-pulse' }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
