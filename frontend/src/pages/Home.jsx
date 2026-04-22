import React, { useState } from 'react';
import { Stethoscope, User, ShieldCheck, ArrowRight, ClipboardList, Building2, Mail, Lock, UserPlus, Calendar, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home({ onLogin }) {
  const [activeTab, setActiveTab] = useState('doctor'); // 'doctor' or 'patient'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    clinicName: '',
    
    age: '',
    gender: 'Male',
    contact: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Dynamic Endpoint Selection
    let endpoint = '';
    if (activeTab === 'doctor') {
      endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    } else {
      endpoint = authMode === 'login' ? '/api/auth/patient/login' : '/api/auth/patient/register';
    }

    try {
      const response = await fetch(`https://ayurconnect-portal.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(authMode === 'login' ? 'Welcome Back!' : 'Account Created Successfully!');
        localStorage.setItem('token', data.token);
        onLogin(data.doctor || data.patient);
      } else {
        toast.error(data.msg || 'Authentication failed');
      }
    } catch (error) {
      toast.error('Server connection failed. Check your backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-primary-50">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Branding Section */}
        <div className="space-y-6 hidden lg:block">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">WHO & AYUSH Standardized</span>
          </div>
          <h1 className="text-6xl font-extrabold text-slate-900 leading-tight">
            Integrated <span className="text-primary-600">Ayurvedic</span> Health Intelligence.
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            The world's first EHR bridging the gap between ancient NAMASTE terminology and ICD-11 global clinical standards.
          </p>
        </div>

        {/* Right Auth Card */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary-200/50 border border-slate-100 overflow-hidden">
          {/* Top Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => { setActiveTab('doctor'); setAuthMode('login'); }}
              className={`flex-1 py-5 font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'doctor' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-400'}`}
            >
              <Stethoscope className="w-5 h-5" /> Doctor
            </button>
            <button
              onClick={() => { setActiveTab('patient'); setAuthMode('login'); }}
              className={`flex-1 py-5 font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'patient' ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/30' : 'text-slate-400'}`}
            >
              <User className="w-5 h-5" /> Patient
            </button>
          </div>

          <div className="p-10">
            <h3 className="text-3xl font-bold text-slate-900 mb-2">
              {activeTab === 'doctor'
                ? (authMode === 'login' ? 'Doctor Login' : 'Doctor Registration')
                : (authMode === 'login' ? 'Patient Login' : 'Patient Signup')}
            </h3>
            <p className="text-slate-500 mb-8">
              {activeTab === 'doctor'
                ? (authMode === 'login' ? 'Access your clinical dashboard' : 'Join our medical network')
                : (authMode === 'login' ? 'Access records with your Health ID' : 'Create your ID to share medical history')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* --- DOCTOR SIGNUP FIELDS --- */}
              {activeTab === 'doctor' && authMode === 'signup' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="name" onChange={handleInputChange} type="text" placeholder="Full Name" className="auth-input pl-11" required />
                    </div>
                    <div className="relative">
                      <ClipboardList className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="specialization" onChange={handleInputChange} type="text" placeholder="Specialization" className="auth-input pl-11" required />
                    </div>
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="clinicName" onChange={handleInputChange} type="text" placeholder="Clinic / Hospital Name" className="auth-input pl-11" required />
                  </div>
                </>
              )}

              {/* --- PATIENT SIGNUP FIELDS --- */}
              {activeTab === 'patient' && authMode === 'signup' && (
                <>
                  <div className="relative">
                    <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="name" onChange={handleInputChange} type="text" placeholder="Full Name" className="auth-input pl-11" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input name="age" onChange={handleInputChange} type="number" placeholder="Age" className="auth-input pl-11" required />
                    </div>
                    <select name="gender" onChange={handleInputChange} className="auth-input">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="contact" onChange={handleInputChange} type="text" placeholder="Contact Number" className="auth-input pl-11" required />
                  </div>
                </>
              )}

              {/* --- SHARED LOGIN/SIGNUP FIELDS --- */}
              <div className="relative">
                {activeTab === 'doctor' || authMode === 'signup' ? (
                  <>
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="email" onChange={handleInputChange} type="email" placeholder="Email Address" className="auth-input pl-11" required />
                  </>
                ) : (
                  <>
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500" />
                   <input 
  name="email" 
  onChange={handleInputChange} 
  type="email" 
  placeholder="Email Address (e.g., patient@example.com)" 
  className="auth-input pl-11" 
  required 
/>
                  </>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input name="password" onChange={handleInputChange} type="password" placeholder="Password" className="auth-input pl-11" required />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 group mt-4 disabled:bg-slate-300"
              >
                {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Get My Health ID')}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* Toggle Links */}
            <div className="mt-8 text-center text-sm">
              <span className="text-slate-500">
                {activeTab === 'doctor'
                  ? (authMode === 'login' ? "New to the platform?" : "Already registered?")
                  : (authMode === 'login' ? "Don't have a Health ID?" : "Already have an account?")}
              </span>{' '}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-primary-600 font-bold hover:underline"
              >
                {authMode === 'login' ? 'Register Now' : 'Back to Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}