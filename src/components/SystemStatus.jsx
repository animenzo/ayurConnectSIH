import React from 'react';
import { CheckCircle, AlertTriangle, Wifi, Database, Globe } from 'lucide-react';

const systemChecks = [
  { name: 'API Connection', status: 'online', icon: Wifi },
  { name: 'Database', status: 'online', icon: Database },
  { name: 'ICD-11 API', status: 'online', icon: Globe },
  { name: 'Validation Service', status: 'warning', icon: AlertTriangle },
];

export default function SystemStatus() {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <CheckCircle className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
          <p className="text-sm text-slate-500">Real-time system health monitoring</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {systemChecks.map((check) => (
          <div key={check.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-3">
              <check.icon className={`w-4 h-4 ${
                check.status === 'online' ? 'text-success-600' : 'text-warning-600'
              }`} />
              <span className="font-medium text-slate-900">{check.name}</span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              check.status === 'online' 
                ? 'bg-success-100 text-success-700' 
                : 'bg-warning-100 text-warning-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                check.status === 'online' ? 'bg-success-500' : 'bg-warning-500'
              }`}></div>
              {check.status === 'online' ? 'Online' : 'Warning'}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-primary-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-primary-700">
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">System Health: 98.5% uptime</span>
        </div>
        <p className="text-xs text-primary-600 mt-1">All core services operational</p>
      </div>
    </div>
  );
}