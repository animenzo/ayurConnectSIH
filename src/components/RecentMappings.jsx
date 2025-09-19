import React from 'react';
import { medicalMappings } from '../data/medicalData';
import { Clock, ArrowRight } from 'lucide-react';

export default function RecentMappings({ setActivePage }) {
  const recentMappings = medicalMappings.slice(0, 3);
  
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success-100 rounded-lg">
            <Clock className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Mappings</h3>
            <p className="text-sm text-slate-500">Latest NAMASTE-ICD11 mappings</p>
          </div>
        </div>
        <button className="btn-secondary text-sm" onClick={() => setActivePage('search')}>
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {recentMappings.map((mapping) => (
          <div key={mapping.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                  {mapping.namasteCode}
                </span>
                <span className="font-medium text-slate-900">{mapping.englishName}</span>
              </div>
              <span className={`confidence-${mapping.confidenceLevel.toLowerCase()}`}>
                {mapping.confidenceLevel}
              </span>
            </div>
            <div className="text-sm text-slate-600 mb-2">
              <span className="font-medium">{mapping.namasteName}</span> → {mapping.icdCode}
            </div>
            <p className="text-xs text-slate-500">Updated {mapping.lastUpdated}</p>
          </div>
        ))}
      </div>
    </div>
  );
}