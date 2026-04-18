import React from 'react';
import { Database, Link2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function MetricsCards({ stats, isLoading }) {
  const cards = [
    {
      title: "Total NAMASTE Codes",
      value: isLoading ? "..." : stats.totalMappings.toLocaleString(),
      icon: Database,
      color: "bg-blue-100 text-blue-600",
      trend: "Total in Database"
    },
    {
      title: "Linked to ICD-11",
      value: isLoading ? "..." : stats.mappedToIcd.toLocaleString(),
      icon: Link2,
      color: "bg-success-100 text-success-600",
      trend: "AI Synced"
    },
   
    {
      title: "Pending Review",
      value: isLoading ? "..." : stats.pendingReview.toLocaleString(),
      icon: AlertCircle,
      color: "bg-warning-100 text-warning-600",
      trend: "Needs Mapping"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="card p-6 flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className={`p-3 rounded-xl ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{card.trend}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}