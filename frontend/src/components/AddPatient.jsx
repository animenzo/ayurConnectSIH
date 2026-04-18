import React, { useState } from 'react';
import { UserPlus, Search, Save, Pill, Activity, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPatient({ setActivePage }) {
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [patientExists, setPatientExists] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    name: '', // Will be auto-filled after verification
    age: '',
    gender: 'Male',
    NAMC_CODE: '',
    diseaseName: '',
    ICD_11_code: '',
    diagnosis: '',
    symptoms: [],
    medicines: [{ name: '', dosage: '', duration: '' }]
  });

  // --- 1. VERIFY PATIENT ID (Provided by Patient) ---
  const verifyPatientId = async (id) => {
    if (!id || id.length < 5) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`https://ayurconnect-portal.onrender.com/api/patients/verify/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();

      if (res.ok) {
        setFormData(prev => ({ ...prev, name: data.name, patientId: id }));
        setPatientExists(true);
        toast.success(`Verified: ${data.name}`);
      } else {
        setPatientExists(false);
        setFormData(prev => ({ ...prev, name: '' }));
        toast.error("Patient ID not found. Patient must sign up first.");
      }
    } catch (err) {
      toast.error("Verification server error");
    } finally {
      setIsVerifying(false);
    }
  };

  // --- 2. NAMASTE CODE LOOKUP ---
  const handleLookup = async (code) => {
    if (!code || code.length < 3) return;
    setIsLookingUp(true);
    try {
      const res = await fetch(`https://ayurconnect-portal.onrender.com/api/patients/lookup/${code}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();

      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          NAMC_CODE: code.toUpperCase(),
          diseaseName: data.name,
          ICD_11_code: data.icd,
          symptoms: data.symptoms,
          diagnosis: data.description
        }));
        toast.success("NAMASTE Mapping Found");
      }
    } catch (err) {
      toast.error("Terminology lookup failed");
    } finally {
      setIsLookingUp(false);
    }
  };

  // --- 3. SAVE CONSULTATION ---
  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!patientExists) return toast.error("Please verify a valid Patient ID first");

    try {
      const res = await fetch('https://ayurconnect-portal.onrender.com/api/patients/add-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success("Consultation Synced to Patient Record");
        setActivePage('dashboard');
      } else {
        toast.error("Failed to save consultation");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserPlus className="text-primary-600" /> New Consultation
        </h2>
      </div>

      <form onSubmit={handleSaveConsultation} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Patient ID & Verification */}
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
            <h3 className="font-bold text-slate-800 border-b pb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-600" /> Patient Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="text-xs font-bold text-slate-400 uppercase">Enter Patient ID</label>
                <input
                  required
                  type="text"
                  className={`consult-input font-mono uppercase tracking-widest ${patientExists ? 'border-green-500 bg-green-50' : ''}`}
                  placeholder="PAT-2026-XXXX"
                  onBlur={(e) => verifyPatientId(e.target.value.toUpperCase())}
                />
                {isVerifying && <Loader2 className="absolute right-3 top-9 w-4 h-4 animate-spin text-primary-600" />}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Verified Name</label>
                <input
                  readOnly
                  value={formData.name}
                  className="consult-input bg-slate-100 cursor-not-allowed font-bold"
                  placeholder="Waiting for ID..."
                />
              </div>
            </div>
          </div>

          {/* NAMASTE/ICD Mapping */}
          <div className="bg-primary-50/50 p-8 rounded-[2rem] border border-primary-100 space-y-6">
            <h3 className="font-bold text-primary-900 flex items-center gap-2">
              <Search className="w-4 h-4" /> Clinical Diagnosis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-xs font-bold text-primary-700 uppercase">NAMC Code</label>
                <input
                  type="text"
                  className="consult-input border-primary-200 uppercase font-mono"
                  placeholder="e.g. AAB-40"
                  onBlur={(e) => handleLookup(e.target.value)}
                />
                {isLookingUp && <Loader2 className="absolute right-3 top-9 w-4 h-4 animate-spin text-primary-600" />}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-primary-700 uppercase">Disease Name (ICD-11)</label>
                <input type="text" value={formData.diseaseName} readOnly className="consult-input bg-white/50 border-primary-200" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-primary-700 uppercase">Mapped Symptoms</label>
              <div className="flex flex-wrap gap-2 p-4 bg-white/80 rounded-2xl min-h-[60px] border border-primary-100">
                {formData.symptoms.length > 0 ? formData.symptoms.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-white text-primary-700 border border-primary-100 rounded-full text-xs font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {s}
                  </span>
                )) : <span className="text-slate-400 text-sm italic">Populates on valid NAMC Code...</span>}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6 flex flex-col h-full">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-500" /> Prescription
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Medication</label>
                <input
                  type="text"
                  className="consult-input"
                  placeholder="e.g. Triphala Churna"
                  onChange={(e) => {
                    let meds = [...formData.medicines];
                    meds[0].name = e.target.value;
                    setFormData({ ...formData, medicines: meds });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Dosage</label>
                  <input
                    type="text" className="consult-input" placeholder="1-0-1"
                    onChange={(e) => {
                      let meds = [...formData.medicines];
                      meds[0].dosage = e.target.value;
                      setFormData({ ...formData, medicines: meds });
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Duration</label>
                  <input
                    type="text" className="consult-input" placeholder="7 Days"
                    onChange={(e) => {
                      let meds = [...formData.medicines];
                      meds[0].duration = e.target.value;
                      setFormData({ ...formData, medicines: meds });
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-auto">
              <button
                type="submit"
                disabled={!patientExists}
                className={`w-full py-4 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg ${patientExists ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-primary-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                <Save className="w-5 h-5" /> Save Consultation
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-tighter">
                Securely syncing with Patient Global Health ID
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}