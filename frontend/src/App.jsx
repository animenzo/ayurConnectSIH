import React, { useState } from 'react';
import Home from './pages/Home';
import PatientSignup from './pages/PatientSignup'; // The new page
import PatientDashboard from './components/PatientDashboard'; // Where they see their ID
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard'
import DoctorProfile from './components/DoctorProfile';
import AddPatient from './components/AddPatient';
import SearchPage from './components/SearchPage';
import ApiDocs from './components/ApiDocs';
import DetailedDatabaseList from './components/DetailedDatabaseList';



// ... other imports

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // If a patient logs in, they go to their specific dashboard
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setActivePage('dashboard'); // Or 'home' if you have a landing page
  };

  if (!user) {
    // Check if user clicked "Register" on the Home page
    if (activePage === 'patient-signup') return <PatientSignup onLogin={handleLogin} setActivePage={setActivePage} />;
    return <Home onLogin={handleLogin} setActivePage={setActivePage} />;
  }

  // Determine what to show based on Role (Doctor vs Patient)
// Determine what to show based on Role (Doctor vs Patient)
  const renderRoleBasedContent = () => {
    if (user.role === 'patient' || user.patientId) {
      return <PatientDashboard user={user} />;
    }

    // Standard Doctor logic
    switch (activePage) {
      // Existing pages
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'add-patient': return <AddPatient setActivePage={setActivePage} />;
      case 'profile': return <DoctorProfile setActivePage={setActivePage} />;
      
      // 👇 ADD THE MISSING SIDEBAR PAGES HERE 👇
      case 'search': return <SearchPage/> ; // Replace with your actual component
      case 'validation': return <div className="p-10">Validation Page Coming Soon...</div>; // Replace with your actual component
      case 'api-docs': return <ApiDocs/> ; // Replace with your actual component
      case 'database-list': return <DetailedDatabaseList />;

      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {user.role !== 'patient' && <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} />}
      <div className={`flex flex-col flex-1 ${user.role !== 'patient' ? 'ml-64' : ''}`}>
        <Header user={user} setActivePage={setActivePage} onLogout={handleLogout} />
        <main className="flex-1 p-6">
          {renderRoleBasedContent()}
        </main>
      </div>
    </div>
  );
}