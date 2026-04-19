import React, { useState } from 'react';
import { UserPlus, Save, Pill, Activity, ShieldCheck, Loader2, FileText, ClipboardEdit, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPatient({ setActivePage }) {
  const [isLookingUp, setIsLookingUp] = useState(false); // For instant DB fetch
  const [isAiLoading, setIsAiLoading] = useState(false); // NEW: For background AI generation
  const [isVerifying, setIsVerifying] = useState(false);
  const [patientExists, setPatientExists] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    name: '', 
    age: '',
    gender: 'Male',
    NAMC_CODE: '',
    diseaseName: '',
    ICD_11_code: '',
    diagnosis: '', 
    doctorNotes: '', 
    symptoms: [],
    medicines: [{ name: '', dosage: '', duration: '' }]
  });

  // --- REUSABLE TAILWIND CLASSES ---
  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm";
  const labelStyles = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1";

  // --- 1. VERIFY PATIENT ID ---
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

  // --- 2. THE 2-STEP SMART MAPPING (DB First, AI Second) ---
  const handleSmartMapping = async (searchQuery) => {
    const query = searchQuery || formData.NAMC_CODE || formData.diseaseName;
    if (!query || query.trim().length < 2) return;

    setIsLookingUp(true);
    try {
      // STEP 1: Fast Database Lookup
      const dbRes = await fetch(`https://ayurconnect-portal.onrender.com/api/patients/lookup/${encodeURIComponent(query)}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const dbData = await dbRes.json();

      if (dbRes.ok) {
        // Instantly show whatever is in the DB
        setFormData(prev => ({
          ...prev,
          NAMC_CODE: dbData.namcCode || dbData.NAMC_CODE || prev.NAMC_CODE,
          diseaseName: dbData.name || dbData.diseaseName || prev.diseaseName,
          ICD_11_code: dbData.icd || dbData.ICD_11_code || 'Not Linked',
          symptoms: dbData.symptoms && dbData.symptoms.length > 0 ? dbData.symptoms : prev.symptoms,
          diagnosis: dbData.description || dbData.diagnosis || prev.diagnosis
        }));

        // STEP 2: Check if AI is needed!
        const currentIcd = dbData.icd || dbData.ICD_11_code || 'Not Linked';
        const extractedNamcCode = dbData.namcCode || dbData.NAMC_CODE || query;

        if (currentIcd === 'Not Linked' || currentIcd === '--' || currentIcd === 'Pending AI Sync...') {
          setIsAiLoading(true);
          
          try {
            // Trigger background AI endpoint
            const aiRes = await fetch('https://ayurconnect-portal.onrender.com/api/diseases/trigger-ai', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token') // Added token just in case your route is protected
              },
              body: JSON.stringify({ NAMC_CODE: extractedNamcCode }) 
            });

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              
              // Update the UI with the freshly generated AI data!
              setFormData(prev => ({
                ...prev,
                ICD_11_code: aiData.ICD_11_code || aiData.icd11Code || aiData.icdCode || prev.ICD_11_code,
                symptoms: aiData.symptoms && aiData.symptoms.length > 0 ? aiData.symptoms : prev.symptoms,
                diagnosis: aiData.description || aiData.commonDescription || aiData.icdDescription || prev.diagnosis
              }));
              toast.success("AI Successfully Mapped ICD-11 Code!");
            }
          } catch (aiError) {
            console.error("Failed to trigger AI on demand:", aiError);
            toast.error("AI Mapping failed to respond.");
          } finally {
            setIsAiLoading(false);
          }
        }
      } else {
        console.log("No exact match in DB for:", query);
      }
    } catch (err) {
      console.error("Lookup server error", err);
    } finally {
      setIsLookingUp(false);
    }
  };

  // --- 3. SAVE CONSULTATION ---
  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!patientExists) return toast.error("Please verify a valid Patient ID first");

    try {
      const payloadToSend = {
        ...formData,
        icdCode: formData.ICD_11_code 
      };

      const res = await fetch('https://ayurconnect-portal.onrender.com/api/patients/add-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(payloadToSend)
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
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserPlus className="text-primary-600 w-8 h-8" /> New Consultation
        </h2>
      </div>

      <form onSubmit={handleSaveConsultation} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: Patient Info & Clinical Diagnosis */}
        <div className="lg:col-span-8 space-y-8">

          {/* Patient Verification */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2 text-lg">
              <ShieldCheck className="w-6 h-6 text-primary-600" /> Patient Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelStyles}>Enter Patient ID</label>
                <input
                  required
                  type="text"
                  className={`${inputStyles} font-mono uppercase tracking-widest ${patientExists ? 'border-green-400 bg-green-50 focus:ring-green-500/20 focus:border-green-500' : ''}`}
                  placeholder="PAT-2026-XXXX"
                  onBlur={(e) => verifyPatientId(e.target.value.toUpperCase())}
                />
                {isVerifying && <Loader2 className="absolute right-4 top-10 w-5 h-5 animate-spin text-primary-600" />}
              </div>
              <div>
                <label className={labelStyles}>Verified Name</label>
                <input
                  readOnly
                  value={formData.name}
                  className={`${inputStyles} bg-slate-100/70 border-slate-200 text-slate-500 cursor-not-allowed font-medium`}
                  placeholder="Waiting for ID..."
                />
              </div>
            </div>
          </div>

          {/* NAMASTE/ICD Mapping & Clinical Details */}
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2 text-lg">
              <FileText className="w-6 h-6 text-primary-600" /> Clinical Assessment
            </h3>
            
            <div className="space-y-6">
              
              {/* Row 1: Codes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className={labelStyles}>NAMC Code (Optional)</label>
                  <input
                    type="text"
                    value={formData.NAMC_CODE}
                    onChange={(e) => setFormData({ ...formData, NAMC_CODE: e.target.value })}
                    onBlur={(e) => handleSmartMapping(e.target.value)}
                    className={`${inputStyles} uppercase font-mono`}
                    placeholder="e.g. AAB-40"
                  />
                  {/* Shows loader if instant DB fetch is running */}
                  {isLookingUp && !isAiLoading && <Loader2 className="absolute right-4 top-10 w-5 h-5 animate-spin text-primary-600" />}
                </div>

                <div className="relative">
                  <label className={labelStyles}>ICD-11 Code</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={formData.ICD_11_code || ''}
                      className={`${inputStyles} ${isAiLoading ? 'bg-indigo-50 border-indigo-200 text-indigo-500' : 'bg-slate-100/70 border-slate-200 text-slate-500'} font-mono`}
                      placeholder={isAiLoading ? "AI is generating code..." : "Auto-fills from DB/AI"}
                    />
                    {/* Shows cool Sparkle loader when AI is working in background */}
                    {isAiLoading && (
                      <div className="absolute right-4 top-3.5 flex items-center gap-2 text-indigo-500 text-xs font-bold animate-pulse">
                        <Sparkles className="w-4 h-4" /> AI MAPPING...
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Row 2: Disease Name */}
              <div className="relative">
                <label className={labelStyles}>Disease Name (Ayurvedic/English)</label>
                <input 
                  type="text" 
                  value={formData.diseaseName} 
                  onChange={(e) => setFormData({ ...formData, diseaseName: e.target.value })}
                  onBlur={(e) => {
                    if (!formData.ICD_11_code || formData.ICD_11_code === 'Not Linked') {
                      handleSmartMapping(e.target.value);
                    }
                  }}
                  className={inputStyles} 
                  placeholder="e.g. Kasah or Cough (Type & click away to auto-map)"
                />
              </div>

              {/* Row 3: Doctor's Clinical Diagnosis */}
              <div className="relative">
                <label className={labelStyles}>Doctor's Clinical Diagnosis</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className={`${inputStyles} min-h-[120px] resize-y ${isAiLoading ? 'opacity-70' : ''}`}
                  placeholder="Describe the disease, note Nadi Pariksha results, or write detailed clinical observations..."
                />
              </div>

              {/* Row 4: Mapped Symptoms */}
              <div>
                <label className={labelStyles}>Mapped Symptoms (from AI/Code)</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[70px]">
                  {formData.symptoms.length > 0 ? formData.symptoms.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white text-primary-700 border border-primary-100 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Activity className="w-3 h-3" /> {s}
                    </span>
                  )) : <span className="text-slate-400 text-sm italic mt-1 ml-1">{isAiLoading ? 'AI is extracting symptoms...' : 'Populates automatically after Mapping...'}</span>}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Prescription & Notes */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col h-full sticky top-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2 text-lg">
              <Pill className="w-6 h-6 text-emerald-500" /> Treatment & Notes
            </h3>

            {/* Prescription Inputs */}
            <div className="space-y-6 flex-1">
              <div>
                <label className={labelStyles}>Medication</label>
                <input
                  type="text"
                  className={inputStyles}
                  placeholder="e.g. Triphala Churna"
                  onChange={(e) => {
                    let meds = [...formData.medicines];
                    meds[0].name = e.target.value;
                    setFormData({ ...formData, medicines: meds });
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelStyles}>Dosage</label>
                  <input
                    type="text" 
                    className={inputStyles} 
                    placeholder="1-0-1"
                    onChange={(e) => {
                      let meds = [...formData.medicines];
                      meds[0].dosage = e.target.value;
                      setFormData({ ...formData, medicines: meds });
                    }}
                  />
                </div>
                <div>
                  <label className={labelStyles}>Duration</label>
                  <input
                    type="text" 
                    className={inputStyles} 
                    placeholder="7 Days"
                    onChange={(e) => {
                      let meds = [...formData.medicines];
                      meds[0].duration = e.target.value;
                      setFormData({ ...formData, medicines: meds });
                    }}
                  />
                </div>
              </div>

              {/* Doctor's Notes/Advice Field */}
              <div className="pt-2">
                <label className={`${labelStyles} flex items-center gap-1.5`}>
                  <ClipboardEdit className="w-3.5 h-3.5" /> Patient Advice / Diet Notes
                </label>
                <textarea
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                  className={`${inputStyles} min-h-[160px] resize-y bg-yellow-50/30 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400/20`}
                  placeholder="Pathya-Apathya (dietary rules), lifestyle changes, or general instructions..."
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-8 mt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={!patientExists || isAiLoading}
                className={`w-full py-4 text-sm uppercase tracking-wider font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${patientExists && !isAiLoading ? 'bg-primary-600 hover:bg-primary-700 hover:-translate-y-0.5 text-white shadow-primary-500/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}
              >
                {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isAiLoading ? 'Waiting for AI...' : 'Save Consultation'}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-wider font-medium">
                Securely syncing with Global Health ID
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}