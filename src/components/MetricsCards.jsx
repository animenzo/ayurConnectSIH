import React from 'react';
import { Activity, Clock, Code, Shield, TrendingUp, TrendingDown } from 'lucide-react';

const metrics = [
  {
    id: 1,
    title: 'Total Mappings',
    value: '2,847',
    change: '+12.5%',
    trend: 'up',
    icon: Activity,
    color: 'primary',
    description: 'NAMASTE to ICD-11 mappings'
  },
  {
    id: 2,
    title: 'Pending Validations',
    value: '23',
    change: '-8.2%',
    trend: 'down',
    icon: Clock,
    color: 'warning',
    description: 'Awaiting clinical review'
  },
  {
    id: 3,
    title: 'NAMASTE Codes',
    value: '5,240',
    change: '+5.7%',
    trend: 'up',
    icon: Code,
    color: 'success',
    description: 'Traditional medicine codes'
  },
  {
    id: 4,
    title: 'High Confidence',
    value: '2,654',
    change: '+18.9%',
    trend: 'up',
    icon: Shield,
    color: 'primary',
    description: 'Validated mappings'
  },
];

const colorClasses = {
  primary: {
    bg: 'bg-primary-50',
    border: 'border-l-primary-500',
    icon: 'bg-primary-100 text-primary-600',
    text: 'text-primary-600'
  },
  success: {
    bg: 'bg-success-50',
    border: 'border-l-success-500',
    icon: 'bg-success-100 text-success-600',
    text: 'text-success-600'
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-l-warning-500',
    icon: 'bg-warning-100 text-warning-600',
    text: 'text-warning-600'
  }
};

export default function MetricsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map(({ id, title, value, change, trend, icon: Icon, color, description }) => {
        const colorClass = colorClasses[color];
        const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;
        const trendColor = trend === 'up' ? 'text-success-600' : 'text-danger-600';
        
        return (
          <div key={id} className={`card p-6 border-l-4 ${colorClass.border} ${colorClass.bg}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
                <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{change}</span>
                  </div>
                  <span className="text-xs text-slate-500">this month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{description}</p>
              </div>
              <div className={`p-3 rounded-xl ${colorClass.icon}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}