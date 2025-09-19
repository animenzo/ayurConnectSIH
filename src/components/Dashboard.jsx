import React from 'react';
import MetricsCards from './MetricsCards';
import QuickSearch from './QuickSearch';
import RecentMappings from './RecentMappings';
import SystemStatus from './SystemStatus';

export default function Dashboard({ setActivePage }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500 mt-1">Monitor and manage NAMASTE-ICD11 medical terminology mappings</p>
        </div>
        <div className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      <MetricsCards />
      <QuickSearch setActivePage={setActivePage} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentMappings setActivePage={setActivePage} />
        <SystemStatus />
      </div>
    </div>
  );
}