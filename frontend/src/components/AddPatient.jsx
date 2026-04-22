import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, Save, Pill, Activity, ShieldCheck, Loader2, FileText, ClipboardEdit, Sparkles, Search, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddPatient({ setActivePage }) {
  const [isLookingUp, setIsLookingUp] = useState(false); 
  const [isAiLoading, setIsAiLoading] = useState(false); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [patientExists, setPatientExists] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null); 
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);
  const dropdownContainerRef = useRef(null);

  const [formData, setFormData] = useState({
    patientId: '',
    name: '', 
    age: '',
    gender: 'Male',
    NAMC_CODE: '',
    diseaseName: '',
    ICD_11_code: '',
    diagnosis: '', // This now holds the AI's Disease Description
    doctorDiagnosis: '', // NEW: This holds the doctor's manual diagnosis!
    doctorNotes: '', 
    symptoms: [],
    medicines: [{ name: '', dosage: '', duration: '' }] 
  });

  const inputStyles = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm";
  const labelStyles = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 pl-1";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DYNAMIC MEDICATION FUNCTIONS ---
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = value;
    setFormData({ ...formData, medicines: updatedMedicines });
  };

  const addMedicineRow = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', duration: '' }]
    });
  };

  const removeMedicineRow = (index) => {
    const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: updatedMedicines });
  };

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

  // --- 2. LIVE SEARCH TYPING HANDLER ---
  const handleLiveSearch = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      setActiveDropdown(null);
      return;
    }

    setActiveDropdown(field);
    setIsSearching(true);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://ayurconnect-portal.onrender.com/api/diseases/search?q=${encodeURIComponent(value)}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // --- 3. SELECTING A RESULT FROM DROPDOWN ---
 const handleSelectResult = (item) => {
    const icdCode = item.ICD_11_code && item.ICD_11_code !== 'Not Linked' && item.ICD_11_code !== '--' ? item.ICD_11_code : '';
    const namcCode = item.NAMC_CODE || item.namasteCode || '';
    
    // Check if we have descriptions and symptoms
    const hasDescription = item.commonDescription || item.long_definition;
    const hasSymptoms = item.symptoms && item.symptoms.length > 0;
    
    setFormData(prev => ({
      ...prev,
      NAMC_CODE: namcCode,
      diseaseName: item.name_english || item.NAMC_term_DEVANAGARI || item.NAMC_term ||'',
      ICD_11_code: icdCode,
      diagnosis: hasDescription || '', 
      symptoms: item.symptoms || []
    }));
    
    setActiveDropdown(null);

    // ✨ THE FIX: Trigger AI if the ICD code is missing, OR if the description/symptoms are missing!
    if (namcCode && (!icdCode || !hasDescription || !hasSymptoms)) {
      triggerBackgroundAI(namcCode);
    }
  };

  // --- 4. BACKGROUND AI TRIGGER ---
  const triggerBackgroundAI = async (namcCode) => {
    setIsAiLoading(true);
    try {
      const aiRes = await fetch('https://ayurconnect-portal.onrender.com/api/diseases/trigger-ai', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ NAMC_CODE: namcCode }) 
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        setFormData(prev => ({
          ...prev,
          ICD_11_code: aiData.ICD_11_code || aiData.icd11Code || prev.ICD_11_code,
          symptoms: aiData.symptoms && aiData.symptoms.length > 0 ? aiData.symptoms : prev.symptoms,
          diagnosis: aiData.commonDescription || aiData.description || prev.diagnosis
        }));
        toast.success("AI Mapped Missing ICD-11 Code!");
      }
    } catch (err) {
      console.error("AI trigger failed:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- 5. SAVE CONSULTATION ---
  const handleSaveConsultation = async (e) => {
    e.preventDefault();
    if (!patientExists) return toast.error("Please verify a valid Patient ID first");

    const cleanedMedicines = formData.medicines.filter(m => m.name.trim() !== '');

    try {
      const payloadToSend = { 
        ...formData, 
        icdCode: formData.ICD_11_code,
        medicines: cleanedMedicines 
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
        setActivePage('profile'); 
      } else {
        toast.error("Failed to save consultation");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const renderDropdown = (fieldMatch) => {
    if (activeDropdown !== fieldMatch || searchResults.length === 0) return null;

    return (
      <div className="absolute top-[105%] left-0 w-full bg-white border border-slate-200 shadow-2xl rounded-xl z-50 max-h-64 overflow-y-auto">
        <ul className="divide-y divide-slate-100">
          {searchResults.map((item, idx) => (
            <li 
              key={item._id || idx}
              onMouseDown={() => handleSelectResult(item)} 
              className="px-4 py-3 hover:bg-primary-50 cursor-pointer flex flex-col gap-1 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900 text-sm">
                  {item.NAMC_term_DEVANAGARI || item.NAMC_term || item.sanskritName}
                </span>
                <span className="font-mono text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded">
                  {item.NAMC_CODE || item.namasteCode}
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500 gap-2">
                <span className="truncate max-w-[200px]">{item.name_english || item.englishName}</span>
                {item.ICD_11_code && item.ICD_11_code !== 'Not Linked' && item.ICD_11_code !== '--' && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">ICD: {item.ICD_11_code}</span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
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
                <input readOnly value={formData.name} className={`${inputStyles} bg-slate-100/70 border-slate-200 text-slate-500 cursor-not-allowed font-medium`} placeholder="Waiting for ID..." />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200" ref={dropdownContainerRef}>
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2 text-lg">
              <FileText className="w-6 h-6 text-primary-600" /> Clinical Assessment
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* NAMC CODE SEARCH */}
                <div className="relative">
                  <label className={labelStyles}>NAMC Code</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.NAMC_CODE}
                      onChange={(e) => handleLiveSearch('NAMC_CODE', e.target.value)}
                      className={`${inputStyles} pl-10 uppercase font-mono`}
                      placeholder="Search AAB-40..."
                    />
                    {isSearching && activeDropdown === 'NAMC_CODE' && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary-600" />}
                  </div>
                  {renderDropdown('NAMC_CODE')}
                </div>

                {/* ICD-11 CODE SEARCH */}
                <div className="relative">
                  <label className={labelStyles}>ICD-11 Code</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.ICD_11_code}
                      onChange={(e) => handleLiveSearch('ICD_11_code', e.target.value)}
                      className={`${inputStyles} pl-10 ${isAiLoading ? 'bg-indigo-50 border-indigo-200 text-indigo-500' : ''} font-mono`}
                      placeholder={isAiLoading ? "AI generating..." : "Search QA02..."}
                    />
                    {isSearching && activeDropdown === 'ICD_11_code' && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary-600" />}
                    {isAiLoading && (
                      <div className="absolute right-4 top-3.5 flex items-center gap-2 text-indigo-500 text-xs font-bold animate-pulse">
                        <Sparkles className="w-4 h-4" /> MAPPING
                      </div>
                    )}
                  </div>
                  {renderDropdown('ICD_11_code')}
                </div>
              </div>
              
              {/* DISEASE NAME SEARCH */}
              {/* DISEASE NAME SEARCH */}
              <div className="relative">
                <label className={labelStyles}>Disease Name (Ayurvedic/English)</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={formData.diseaseName} 
                    onChange={(e) => handleLiveSearch('diseaseName', e.target.value)}
                    
                    // ✨ THE FIX: Safety net for when they ignore the dropdown
                    onBlur={() => {
                      // Close dropdown when they click away
                      setTimeout(() => setActiveDropdown(null), 200); 
                      // If they typed something but we don't have an ICD code yet, trigger the AI!
                      if (formData.diseaseName.length > 2 && !formData.ICD_11_code) {
                        // Pass the disease name to the backend so it can search/generate
                        triggerBackgroundAI(formData.diseaseName); 
                      }
                    }}

                    className={`${inputStyles} pl-10`} 
                    placeholder="Search Kasah or Cough disorder..."
                  />
                  {isSearching && activeDropdown === 'diseaseName' && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary-600" />}
                </div>
                {renderDropdown('diseaseName')}
              </div>

              {/* RENAMED: DISEASE DESCRIPTION */}
              <div className="relative">
                <label className={labelStyles}>Disease Description</label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className={`${inputStyles} min-h-[80px] resize-y ${isAiLoading ? 'opacity-70' : ''}`}
                  placeholder="Standard Ayurvedic and modern clinical description (Auto-fills from Database/AI)..."
                />
              </div>

              {/* NEW: DOCTOR'S REAL CLINICAL DIAGNOSIS */}
              <div className="relative pt-2">
                <label className={labelStyles}>Doctor's Clinical Diagnosis</label>
                <textarea
                  value={formData.doctorDiagnosis}
                  onChange={(e) => setFormData({ ...formData, doctorDiagnosis: e.target.value })}
                  className={`${inputStyles} min-h-[120px] resize-y bg-blue-50/30 border-blue-200 focus:border-blue-400 focus:ring-blue-400/20`}
                  placeholder="Write your personal observations, Nadi Pariksha results, and detailed clinical diagnosis here..."
                />
              </div>

              {/* MAPPED SYMPTOMS */}
              <div>
                <label className={labelStyles}>Mapped Symptoms</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[70px]">
                  {formData.symptoms.length > 0 ? formData.symptoms.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-white text-primary-700 border border-primary-100 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Activity className="w-3 h-3" /> {s}
                    </span>
                  )) : <span className="text-slate-400 text-sm italic mt-1 ml-1">{isAiLoading ? 'AI is extracting symptoms...' : 'Populates automatically after selection...'}</span>}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRESCRIPTION & NOTES */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col h-full sticky top-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-2 text-lg">
              <Pill className="w-6 h-6 text-emerald-500" /> Treatment & Notes
            </h3>

            {/* DYNAMIC PRESCRIPTION LIST */}
            <div className="space-y-4 flex-1">
              <label className={labelStyles}>Prescription Details</label>
              
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {formData.medicines.map((med, index) => (
                  <div key={index} className="p-4 bg-slate-50/50 border border-slate-200 rounded-2xl relative group transition-all hover:bg-slate-50 hover:shadow-sm">
                    
                    {formData.medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicineRow(index)}
                        className="absolute -top-2.5 -right-2.5 bg-white text-rose-500 hover:bg-rose-50 border border-rose-100 p-1.5 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        title="Remove Medicine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div className="space-y-3">
                      <input
                        type="text"
                        className={`${inputStyles} bg-white shadow-none`}
                        placeholder="Medication (e.g. Triphala)"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text" 
                          className={`${inputStyles} bg-white shadow-none`}
                          placeholder="Dosage (1-0-1)"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        />
                        <input
                          type="text" 
                          className={`${inputStyles} bg-white shadow-none`}
                          placeholder="Duration (7 Days)"
                          value={med.duration}
                          onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ADD MORE BUTTON */}
              <button
                type="button"
                onClick={addMedicineRow}
                className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 text-primary-600 font-bold text-xs uppercase tracking-wider rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Medicine
              </button>

              {/* DOCTOR NOTES */}
              <div className="pt-4 border-t border-slate-100 mt-4">
                <label className={`${labelStyles} flex items-center gap-1.5`}>
                  <ClipboardEdit className="w-3.5 h-3.5" /> Patient Advice / Diet Notes
                </label>
                <textarea
                  value={formData.doctorNotes}
                  onChange={(e) => setFormData({ ...formData, doctorNotes: e.target.value })}
                  className={`${inputStyles} min-h-[120px] resize-y bg-yellow-50/30 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400/20`}
                  placeholder="Pathya-Apathya (dietary rules), lifestyle changes, or general instructions..."
                />
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-8 mt-4 border-t border-slate-100">
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