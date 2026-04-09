import React from 'react';

interface EmbeddedChartProps {
  baseUrl: string;
  chartId: string;
  height?: string;
  title?: string;
  type?: 'chart' | 'dashboard';
}

const EmbeddedChart: React.FC<EmbeddedChartProps> = ({ 
  baseUrl, 
  chartId, 
  height = '400px', 
  title,
  type = 'chart'
}) => {
  // If the user hasn't provided details yet, show a helpful placeholder
  if (!baseUrl || !chartId) {
    return (
      <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title || 'MongoDB Atlas Chart'}</h3>
        <p className="text-slate-400 max-w-sm">
          To display your official MongoDB Chart here, paste your **Base URL** and **Chart ID** into the component settings.
        </p>
      </div>
    );
  }

  // Handle both individual charts and full dashboards
  const basePath = type === 'dashboard' ? 'dashboards' : 'charts';
  const src = `${baseUrl}/embed/${basePath}?id=${chartId}&theme=dark&autoRefresh=true&maxDataAge=3600&showTitle=false&attribution=false`;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {title && (
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      <iframe
        title={title || 'MongoDB Chart'}
        style={{
          background: 'transparent',
          border: 'none',
          width: '100%',
          height: height,
        }}
        src={src}
      ></iframe>
    </div>
  );
};

export default EmbeddedChart;
