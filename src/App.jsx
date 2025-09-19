import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SearchPage from './components/SearchPage';
import ApiDocs from './components/ApiDocs';
import Validation from './components/Validation';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'search':
        return <SearchPage />;
      case 'validation':
        return <Validation />;
      case 'api-docs':
        return <ApiDocs />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex flex-col flex-1 ml-64">
        <Header setActivePage={setActivePage} />
        <main className="flex-1 p-6">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}