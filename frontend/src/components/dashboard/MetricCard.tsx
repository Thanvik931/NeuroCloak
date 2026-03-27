import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  tooltip?: string;
}

export default function MetricCard({ title, value, icon: Icon, trend, tooltip }: MetricCardProps) {
  return (
    <div className="glass-panel p-5 relative group overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-slate-400 uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
            {trend && <span className="text-xs text-green-400 font-medium bg-green-400/10 px-1.5 py-0.5 rounded">{trend}</span>}
          </div>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      {/* Tooltip on hover */}
      {tooltip && (
        <div className="absolute inset-0 bg-dark-bg/95 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm text-slate-300 text-center backdrop-blur-md font-medium leading-relaxed z-10 rounded-xl cursor-default">
          {tooltip}
        </div>
      )}
    </div>
  );
}
