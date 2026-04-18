import React, { useState } from 'react';
import { User, Mail, Lock, Phone, Calendar, ArrowRight, CheckCircle2, ShieldCheck, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientSignup({ onLogin, setActivePage }) {
  const [step, setStep] = useState(1); // 1: Registration Form, 2: ID Success Screen
  const [newId, setNewId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', age: '', gender: 'Male', contact: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (res.ok) {
        setNewId(data.patient.patientId);
        setStep(2);
        toast.success("Account Created Successfully!");
        // We don't call onLogin yet, we let them see the ID first
      } else {
        toast.error(data.msg || "Registration failed");
      }
    } catch (err) {
      toast.error("Connection to server failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newId);
    toast.success("ID copied to clipboard!");
  };

  // --- STEP 2: THE SUCCESS "IDENTITY CARD" VIEW ---
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 animate-in zoom-in-95 duration-300">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-center border-4 border-primary-600 relative overflow-hidden">
          {/* Decorative Background Icon */}
          <ShieldCheck className="absolute -top-10 -right-10 w-40 h-40 text-primary-50 opacity-10" />
          
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900">Welcome!</h2>
          <p className="text-slate-500 mt-2">Your registration is complete.</p>
          
          <div className="mt-8 space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Global Health ID</p>
            <div className="relative group">
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-primary-200 flex items-center justify-center gap-3">
                <span className="text-4xl font-black text-primary-700 tracking-tighter font-mono">
                  {newId}
                </span>
                <button onClick={copyToClipboard} className="p-2 hover:bg-white rounded-lg transition-colors">
                    <Copy className="w-5 h-5 text-slate-400 hover:text-primary-600" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-xl my-6 border border-amber-100">
            <p className="text-sm text-amber-700 font-medium">
              Important: Please provide this ID to your doctor during your consultation to sync your Ayurvedic records.
            </p>
          </div>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
          >
            Go to My Portal
          </button>
        </div>
      </div>
    );
  }

  // --- STEP 1: THE REGISTRATION FORM ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
        
        {/* Sidebar Branding */}
        <div className="bg-primary-600 p-12 text-white md:w-80 flex flex-col justify-between">
          <div>
            <ShieldCheck className="w-12 h-12 mb-6" />
            <h3 className="text-3xl font-bold mb-4">Patient Identity.</h3>
            <p className="text-primary-100 leading-relaxed">
              Register once to create your secure Health ID. Use it with any Ayurvedic practitioner on our global network.
            </p>
          </div>
          <div className="text-xs text-primary-200">
            Secure • Integrated • Ayurvedic Standards
          </div>
        </div>

        {/* Signup Form */}
        <div className="p-10 flex-1">
          <div className="mb-8">
             <h2 className="text-2xl font-bold text-slate-900">Create Your Profile</h2>
             <p className="text-slate-500 text-sm">Fill in your details to generate your unique ID.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required type="text" placeholder="Full Name" className="auth-input pl-11"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required type="number" placeholder="Age" className="auth-input pl-11"
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <select 
                className="auth-input"
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required type="email" placeholder="Email Address" className="auth-input pl-11"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required type="text" placeholder="Contact Number" className="auth-input pl-11"
                onChange={(e) => setFormData({...formData, contact: e.target.value})}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                required type="password" placeholder="Create Password" className="auth-input pl-11"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-700 transition-all mt-6 shadow-lg shadow-primary-100 disabled:bg-slate-300"
            >
              {loading ? "Generating ID..." : "Generate My Health ID"} 
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-4">
               Already have an ID? <button type="button" onClick={() => setActivePage('home')} className="text-primary-600 font-bold">Login here</button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}