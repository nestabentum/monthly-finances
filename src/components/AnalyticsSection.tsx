import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { CostItem } from '../types';
import { getMonthlyByCategory } from '../utils/calculations';

interface AnalyticsSectionProps {
  costs: CostItem[];
  theme: 'light' | 'dark';
}

// Sleek color palette matching light/dark styling
const COLORS = [
  '#6366f1', // Indigo
  '#a855f7', // Violet
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
];

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ costs, theme }) => {
  const categoryTotals = getMonthlyByCategory(costs);
  
  // Convert to chart data array and sort descending by value
  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    }))
    .sort((a, b) => b.value - a.value);

  const formatEuro = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Custom tooltips for nice styling in dark and light modes
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`chart-tooltip ${theme}`}>
          <p className="tooltip-label">{payload[0].name}</p>
          <p className="tooltip-value">{formatEuro(payload[0].value)} / month</p>
        </div>
      );
    }
    return null;
  };

  if (costs.length === 0) {
    return (
      <div className="analytics-section-container card-panel animate-slide-up">
        <h3 className="section-title">Expense Analytics</h3>
        <div className="empty-analytics-state">
          <p>Add some costs to visualize your monthly expenses in charts.</p>
        </div>
      </div>
    );
  }

  // Styles for grid grid-cols-1 md:grid-cols-2
  return (
    <div className="analytics-section-container card-panel animate-slide-up">
      <h3 className="section-title">Expense Analytics</h3>
      
      <div className="charts-layout">
        {/* Bar Chart Panel */}
        <div className="chart-panel-card">
          <h4 className="chart-title">Cost per Category (Bar Chart)</h4>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: theme === 'dark' ? '#475569' : '#cbd5e1' }}
                />
                <YAxis 
                  tickFormatter={(val) => `€${val}`}
                  tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }}
                  tickLine={{ stroke: theme === 'dark' ? '#475569' : '#cbd5e1' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Panel */}
        <div className="chart-panel-card">
          <h4 className="chart-title">Cost Distribution (Pie Chart)</h4>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={50} // Ring donut style
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1000}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={50}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ 
                    fontSize: '12px', 
                    paddingTop: '10px',
                    color: theme === 'dark' ? '#94a3b8' : '#64748b' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
