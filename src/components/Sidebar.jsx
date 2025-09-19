import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Book, 
  CheckCircle, 
  List, 
  Settings, 
  FileText,
  Stethoscope
} from 'lucide-react';

const menuItems = [
  { key: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { key: 'search', name: 'Advanced Search', icon: Search },
  // { key: 'terminology', name: 'Terminology', icon: Book },
  { key: 'validation', name: 'Validation', icon: CheckCircle },
  // { key: 'problem-list', name: 'Problem Lists', icon: List },
  // { key: 'administration', name: 'Administration', icon: Settings },
  { key: 'api-docs', name: 'API Documentation', icon: FileText },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-white border-r border-slate-200 flex flex-col shadow-lg">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900">NAMASTE-ICD11</h2>
            <p className="text-sm text-slate-500">Integration System</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(({ key, name, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActivePage(key)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              activePage === key
                ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{name}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4">
          <h3 className="font-semibold text-sm text-primary-900 mb-2">Need Help?</h3>
          <p className="text-xs text-primary-700 mb-3">Check our API documentation for integration guidance.</p>
          <button 
            onClick={() => setActivePage('api-docs')}
            className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg transition-colors duration-200"
          >
            View Docs
          </button>
        </div>
      </div>
    </aside>
  );
}