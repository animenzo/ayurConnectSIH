import React from 'react';
import { Search, CheckCircle, Bell, User } from 'lucide-react';

export default function Header({ setActivePage }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              NAMASTE-ICD11 Medical Terminology Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Traditional Medicine Integration with International Standards
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-50"
              />
            </div>
            
            <button className="btn-primary" onClick={() => setActivePage('validation')}>
              <CheckCircle className="w-4 h-4" />
              Validate Mappings
            </button>
            
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full"></span>
            </button>
            
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">Dr. Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}