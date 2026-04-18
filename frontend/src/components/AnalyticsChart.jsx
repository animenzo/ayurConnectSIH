import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export default function AnalyticsCharts({ stats, weeklyData, isLoading }) {
  // 1. DYNAMIC PIE CHART DATA: Powered by your API stats
  // Calculating conflicts as whatever is left over from total minus linked and pending.
  const conflicts = (stats?.totalMappings || 0) - ((stats?.mappedToIcd || 0) + (stats?.pendingReview || 0));
  const safeConflicts = conflicts > 0 ? conflicts : 0;

  const pieData = [
    { name: 'Verified Linked', value: stats?.mappedToIcd || 0, color: '#10b981' },
    { name: 'Pending Review', value: stats?.pendingReview || 0, color: '#f59e0b' },
    { name: 'System Conflicts', value: safeConflicts, color: '#ef4444' },
  ];

  // 2. DYNAMIC BAR CHART DATA: Uses passed weekly data, or falls back to an empty structure
  const barData = weeklyData || [
    { day: 'Mon', mapped: 0 }, { day: 'Tue', mapped: 0 }, { day: 'Wed', mapped: 0 },
    { day: 'Thu', mapped: 0 }, { day: 'Fri', mapped: 0 }, { day: 'Sat', mapped: 0 }, { day: 'Sun', mapped: 0 }
  ];

  const totalCodes = pieData.reduce((acc, curr) => acc + curr.value, 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 bg-white rounded-[24px] border border-slate-100 shadow-sm animate-pulse"></div>
        <div className="h-80 bg-white rounded-[24px] border border-slate-100 shadow-sm animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* LEFT CHART: Dynamic Donut */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Mapping Risk Analytics</h3>
          <p className="text-sm text-slate-500">Live breakdown of current database integration</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between flex-1 gap-6">
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            <div className="flex items-start gap-3">
              <div className="mt-1"><ShieldCheck className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <p className="font-bold text-slate-800">{pieData[0].value.toLocaleString()} Codes</p>
                <p className="text-sm text-slate-500">Linked to ICD-11</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1"><Clock className="w-5 h-5 text-amber-500" /></div>
              <div>
                <p className="font-bold text-slate-800">{pieData[1].value.toLocaleString()} Codes</p>
                <p className="text-sm text-slate-500">Pending Review - Needs Mapping</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1"><AlertTriangle className="w-5 h-5 text-rose-500" /></div>
              <div>
                <p className="font-bold text-slate-800">{pieData[2].value.toLocaleString()} Codes</p>
                <p className="text-sm text-slate-500">System Conflicts</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 h-64 relative">
            {totalCodes > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data available</div>
            )}
            
            {/* Center Text */}
<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
  <span className="text-xs text-slate-400 font-medium text-center leading-tight max-w-[100px]">
    Total NAMASTE Codes
  </span>
  <span className="text-xl font-bold text-slate-800 mt-1">
    {totalCodes.toLocaleString()}
  </span>
</div>
          </div>
        </div>
      </div>

      {/* RIGHT CHART: Dynamic Bar Chart */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Weekly Mapping Statistics</h3>
          <p className="text-sm text-slate-500">Codes verified and linked over the last 7 days</p>
        </div>

        <div className="h-64 mt-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="mapped" fill="#4f46e5" radius={[6, 6, 6, 6]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}