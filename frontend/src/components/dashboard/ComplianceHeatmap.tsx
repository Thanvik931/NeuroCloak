import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays, format } from 'date-fns';

interface HeatmapData {
  date: string;
  count: number;
  complianceRate: number;
}

export default function ComplianceHeatmap({ data }: { data: HeatmapData[] }) {
  const today = new Date();
  const startDate = subDays(today, 365);

  const values = data.map(d => ({
    date: new Date(d.date),
    count: d.count,
    complianceRate: d.complianceRate
  }));

  const getClassForValue = (value: any) => {
    if (!value || value.count === 0) return 'color-empty';
    const num = value.complianceRate;
    if (num > 0.95) return 'color-scale-4'; // Dark Blue 
    if (num > 0.85) return 'color-scale-3'; // Light Blue
    if (num > 0.70) return 'color-scale-2'; // Yellow
    return 'color-scale-1'; // Red
  };

  return (
    <div className="w-full relative heatmap-container overflow-hidden">
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={values}
        classForValue={getClassForValue}
        tooltipDataAttrs={(value: any) => {
          if (!value || !value.date) {
            return {
              'data-tooltip-id': 'heatmap-tooltip',
              'data-tooltip-html': 'No decisions recorded on this day'
            };
          }
          const dt = format(value.date, 'MMM do, yyyy');
          const cr = (value.complianceRate * 100).toFixed(1) + '%';
          return {
            'data-tooltip-id': 'heatmap-tooltip',
            'data-tooltip-html': `<strong>${dt}</strong><br/>Decisions: ${value.count}<br/>Compliance: <span style="color:#3b82f6">${cr}</span>`
          };
        }}
      />
      <Tooltip id="heatmap-tooltip" className="z-[9999] !bg-slate-800 !text-slate-100 !border !border-slate-700 !rounded-md !px-3 !py-2 !text-xs shadow-xl" />
      <style>{`
        .heatmap-container .react-calendar-heatmap text {
          fill: #94a3b8;
          font-size: 8px;
          font-family: inherit;
        }
        .react-calendar-heatmap .color-empty { fill: #1e293b; rx: 2; ry: 2; }
        .react-calendar-heatmap .color-scale-1 { fill: #ef4444; rx: 2; ry: 2; }
        .react-calendar-heatmap .color-scale-2 { fill: #eab308; rx: 2; ry: 2; }
        .react-calendar-heatmap .color-scale-3 { fill: #3b82f6; rx: 2; ry: 2; }
        .react-calendar-heatmap .color-scale-4 { fill: #1d4ed8; rx: 2; ry: 2; }
        .react-calendar-heatmap rect:hover { stroke: #fff; stroke-width: 1px; }
      `}</style>
    </div>
  );
}
