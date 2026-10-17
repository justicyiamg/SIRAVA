import React, { useState } from 'react';
import { ChartData } from '../../types/exam';
import { BarChart3, LineChart, PieChart, Info } from 'lucide-react';

interface InteractiveChartProps {
  data: ChartData;
  className?: string;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ data, className = '' }) => {
  const [activeItem, setActiveItem] = useState<{ label: string; value: number; dataset?: string } | null>(null);

  if (!data || !data.labels || data.labels.length === 0) {
    return null;
  }

  const defaultColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const chartType = data.type || 'bar';

  // Find maximum value across all datasets for scale
  const allValues = data.datasets.flatMap((ds) => ds.data);
  const rawMax = Math.max(...allValues, 10);
  // Add 15% headroom
  const maxVal = Math.ceil(rawMax * 1.15);

  const getIcon = () => {
    switch (chartType) {
      case 'line':
        return <LineChart className="h-4 w-4 text-emerald-600" />;
      case 'pie':
        return <PieChart className="h-4 w-4 text-purple-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-indigo-600" />;
    }
  };

  // Render Bar Chart
  const renderBarChart = () => {
    const chartHeight = 220;
    const paddingBottom = 40;
    const paddingTop = 20;
    const availableHeight = chartHeight - paddingBottom - paddingTop;

    const numGroups = data.labels.length;
    const numDatasets = data.datasets.length;
    const groupWidth = 100 / numGroups;
    const barWidth = Math.min(24, (groupWidth * 0.75) / numDatasets);

    return (
      <div className="relative w-full pt-4">
        {/* Y-axis gridlines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10 pt-4 px-2">
          {[1, 0.75, 0.5, 0.25, 0].map((ratio, idx) => (
            <div key={idx} className="flex items-center w-full">
              <span className="w-10 text-[10px] text-slate-400 font-mono text-right pr-2">
                {Math.round(maxVal * ratio)}
              </span>
              <div className="flex-1 border-b border-dashed border-slate-200"></div>
            </div>
          ))}
        </div>

        {/* Bars Container */}
        <div className="relative pl-12 pr-4 h-[220px] flex items-end">
          {data.labels.map((label, labelIdx) => (
            <div
              key={labelIdx}
              className="flex-1 flex flex-col items-center justify-end h-full z-10 group relative pb-10"
            >
              {/* Bars for each dataset */}
              <div className="flex items-end gap-1 justify-center w-full">
                {data.datasets.map((dataset, dsIdx) => {
                  const val = dataset.data[labelIdx] ?? 0;
                  const heightPercent = Math.max(4, Math.min(100, (val / maxVal) * 100));
                  const barColor = dataset.color || defaultColors[dsIdx % defaultColors.length];

                  return (
                    <div
                      key={dsIdx}
                      className="relative flex flex-col items-center group/bar"
                      onMouseEnter={() =>
                        setActiveItem({
                          label,
                          value: val,
                          dataset: dataset.label,
                        })
                      }
                      onMouseLeave={() => setActiveItem(null)}
                    >
                      {/* Bar fill with smooth hover */}
                      <div
                        className="rounded-t-md transition-all duration-300 hover:brightness-110 cursor-pointer shadow-sm"
                        style={{
                          height: `${(heightPercent * availableHeight) / 100}px`,
                          width: `${barWidth}px`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis Label */}
              <div className="absolute bottom-1 w-full text-center px-1">
                <span
                  className="block text-[11px] font-medium text-slate-600 truncate max-w-full"
                  title={label}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Line Chart
  const renderLineChart = () => {
    const width = 600;
    const height = 220;
    const paddingX = 50;
    const paddingY = 30;
    const usableW = width - paddingX * 2;
    const usableH = height - paddingY * 2;

    const pointsPerDataset = data.datasets.map((dataset, dsIdx) => {
      const step = usableW / Math.max(1, data.labels.length - 1);
      const points = dataset.data.map((val, idx) => {
        const x = paddingX + idx * step;
        const y = height - paddingY - (val / maxVal) * usableH;
        return { x, y, val, label: data.labels[idx], datasetName: dataset.label };
      });
      return {
        ...dataset,
        color: dataset.color || defaultColors[dsIdx % defaultColors.length],
        points,
      };
    });

    return (
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-xs">
          {/* Y Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
            const y = height - paddingY - r * usableH;
            return (
              <g key={i}>
                <text x={paddingX - 8} y={y + 3} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  {Math.round(maxVal * r)}
                </text>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Lines & Shading */}
          {pointsPerDataset.map((series, sIdx) => {
            const pathD = series.points.reduce(
              (acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`,
              ''
            );
            return (
              <g key={sIdx}>
                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={series.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Points */}
                {series.points.map((pt, pIdx) => (
                  <circle
                    key={pIdx}
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke={series.color}
                    strokeWidth="2.5"
                    className="cursor-pointer hover:r-6 transition-all"
                    onMouseEnter={() =>
                      setActiveItem({
                        label: pt.label,
                        value: pt.val,
                        dataset: pt.datasetName,
                      })
                    }
                    onMouseLeave={() => setActiveItem(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* X Axis Labels */}
          {data.labels.map((label, idx) => {
            const step = usableW / Math.max(1, data.labels.length - 1);
            const x = paddingX + idx * step;
            return (
              <text
                key={idx}
                x={x}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-slate-500 font-medium"
              >
                {label.length > 10 ? label.slice(0, 9) + '…' : label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  // Render Pie Chart
  const renderPieChart = () => {
    const dataset = data.datasets[0] || { data: [] };
    const total = dataset.data.reduce((a, b) => a + b, 0) || 1;
    let accumulatedAngle = 0;

    const slices = dataset.data.map((val, idx) => {
      const percentage = (val / total) * 100;
      const angle = (val / total) * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;
      const color = defaultColors[idx % defaultColors.length];

      // Convert angles to SVG arc coordinates
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (startAngle + angle - 90) * (Math.PI / 180);
      const radius = 80;
      const cx = 100;
      const cy = 100;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      const largeArc = angle > 180 ? 1 : 0;

      const pathData =
        dataset.data.length === 1
          ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        pathData,
        color,
        label: data.labels[idx] || `Item ${idx + 1}`,
        val,
        percentage: percentage.toFixed(1),
      };
    });

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
        <svg viewBox="0 0 200 200" className="w-44 h-44 drop-shadow-sm">
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.pathData}
              fill={slice.color}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onMouseEnter={() =>
                setActiveItem({
                  label: slice.label,
                  value: slice.val,
                  dataset: `${slice.percentage}%`,
                })
              }
              onMouseLeave={() => setActiveItem(null)}
            />
          ))}
          {/* Donut hole for modern look */}
          <circle cx="100" cy="100" r="42" fill="#ffffff" />
          <text x="100" y="105" textAnchor="middle" className="text-xs font-bold fill-slate-700">
            {total}
          </text>
        </svg>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-2 max-w-xs">
          {slices.map((slice, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded-md"
              onMouseEnter={() =>
                setActiveItem({
                  label: slice.label,
                  value: slice.val,
                  dataset: `${slice.percentage}%`,
                })
              }
              onMouseLeave={() => setActiveItem(null)}
            >
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="font-medium truncate flex-1">{slice.label}:</span>
              <span className="font-bold text-slate-900">{slice.val}</span>
              <span className="text-slate-400 text-[11px]">({slice.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm my-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-semibold text-slate-800">{data.title || 'Grafik Stimulus Soal'}</span>
        </div>

        {/* Hover tooltips summary */}
        {activeItem && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs animate-fadeIn">
            <span className="font-medium text-indigo-900">{activeItem.label}:</span>
            <span className="font-bold text-indigo-700">{activeItem.value}</span>
            {activeItem.dataset && <span className="text-indigo-500 font-normal">({activeItem.dataset})</span>}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="w-full">
        {chartType === 'line' && renderLineChart()}
        {chartType === 'pie' && renderPieChart()}
        {chartType === 'bar' && renderBarChart()}
      </div>

      {/* Dataset Legend for Bar and Line */}
      {chartType !== 'pie' && data.datasets.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-3 mt-2">
          {data.datasets.map((ds, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="w-3 h-3 rounded-xs shrink-0"
                style={{ backgroundColor: ds.color || defaultColors[idx % defaultColors.length] }}
              />
              <span className="font-medium">{ds.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
