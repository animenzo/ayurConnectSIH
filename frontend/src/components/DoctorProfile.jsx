import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Users, ClipboardList, Search, FileText, Mail, Phone, ExternalLink, UserPlus, X, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import ChatWidget from './ChatWidget';

export default function DoctorProfile({ setActivePage }) {
  const [doctor, setDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  // For Modal
  const [activeChat, setActiveChat] = useState(null);
  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('https://ayurconnect-portal.onrender.com/api/doctors/profile', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      setDoctor(data);
    } catch (err) { console.error("Profile fetch failed"); }
    finally { setLoading(false); }
  };

  // --- ENHANCED PDF GENERATION LOGIC ---
  const generateReport = (patient) => {
    if (!patient.medicalHistory || patient.medicalHistory.length === 0) {
      return toast.error("No medical history available to generate report.");
    }

    const doc = new jsPDF();
    const lastVisit = patient.medicalHistory[patient.medicalHistory.length - 1];

    // 1. Hospital/Clinic Header
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate-900
    doc.setFont("helvetica", "bold");
    doc.text(doctor.clinicName.toUpperCase(), 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // Slate-600
    doc.text(`Dr. ${doctor.name} | ${doctor.specialization}`, 105, 28, { align: 'center' });
    doc.line(20, 35, 190, 35);

    // 2. Patient & Visit Meta Table
    autoTable(doc, {
      startY: 45,
      head: [['Field', 'Patient Details', 'Visit Information']],
      body: [
        ['Name', patient.name, `Date: ${new Date(lastVisit.date).toLocaleDateString()}`],
        ['ID', patient.patientId, `Report ID: ${Math.floor(1000 + Math.random() * 9000)}`],
        ['Demographics', `${patient.age} Years / ${patient.gender}`, `Status: Electronic Record`]
      ],
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 41, 59] },
      columnStyles: { 0: { fontStyle: 'bold', width: 30 } }
    });

    // 3. NAMASTE-ICD11 Integration Section (The Core Details)
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // Primary Indigo
    doc.text("Clinical Mapping & Diagnosis", 20, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      body: [
        ['Disease Name', lastVisit.diseaseName],
        ['NAMASTE Code', lastVisit.NAMC_CODE],
        ['ICD-11 Code', lastVisit.ICD_11_code || 'Pending Integration'],
        ['Term Description', lastVisit.diagnosis || 'Standard Ayurvedic Clinical Definition'],
        ['Symptoms', lastVisit.symptoms.join(', ')]
      ],
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: 'bold', width: 50, textColor: [71, 85, 105] } }
    });

    // 4. Treatment Plan (Prescription)
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129); // Emerald Green
    doc.text("Rx - Treatment Plan", 20, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Medicine Name', 'Dosage', 'Duration / Instructions']],
      body: lastVisit.medicines.map(m => [m.name, m.dosage, m.duration]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 10 }
    });

    // 5. Footer & Validation
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Verified Electronic Medical Record - NAMASTE-ICD11 Standards", 105, pageHeight - 15, { align: 'center' });
    doc.text(`Digital Signature of Dr. ${doctor.name}`, 160, pageHeight - 25);
    doc.line(140, pageHeight - 30, 190, pageHeight - 30);

    doc.save(`${patient.name}_Standard_Report.pdf`);
    toast.success("Standard Medical Report Generated");
  };

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-400 font-bold">Synchronizing Dashboard...</div>;

  const filteredPatients = doctor?.patients?.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleShare = async (patient) => {
    try {
      const res = await fetch(`https://ayurconnect-portal.onrender.com/api/patients/share-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ patientId: patient.patientId })
      });

      if (res.ok) {
        toast.success(`Report synced to ${patient.name}'s portal!`);
      }
    } catch (err) {
      toast.error("Sharing failed");
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">

      {/* 1. Header Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          {/* Change this line near the top of your JSX */}
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-200">
            {doctor?.name ? doctor.name[0] : <User />}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900">{doctor?.name || "Loading..."}</h2>
              {doctor?.doctorId && (
                <span className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-bold rounded-full border border-primary-100 uppercase tracking-wider">
                  {doctor.doctorId}
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium mt-1">
              {doctor?.specialization} • {doctor?.clinicName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActivePage('add-patient')}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary-200 transition-all active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Add New Patient
        </button>
      </div>

      {/* 2. Stats Row (Unchanged) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl"><Users className="text-blue-600" /></div>
          <div><p className="text-2xl font-bold text-slate-900">{doctor.patients.length}</p><p className="text-slate-500 text-sm">Total Patients</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl"><ClipboardList className="text-purple-600" /></div>
          <div><p className="text-2xl font-bold text-slate-900">{doctor.patients.length > 0 ? '12' : '0'}</p><p className="text-slate-500 text-sm">Visits Today</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl"><FileText className="text-green-600" /></div>
          <div><p className="text-2xl font-bold text-slate-900">85%</p><p className="text-slate-500 text-sm">Case Resolution</p></div>
        </div>
      </div>

      {/* 3. Patient Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-slate-900">Patient Directory</h3>
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search Name or ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Patient ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Patient Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Last Diagnosis</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-primary-600">{p.patientId}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{p.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {p.medicalHistory[p.medicalHistory.length - 1]?.diseaseName || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleShare(p)}
                        title="Share with Patient"
                        className="p-2 border rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      >
                        <Share2 className="w-4 h-4" /> {/* Make sure to import Share2 from lucide-react */}
                      </button>
                      <button onClick={() => setSelectedPatient(p)} className="p-2 border rounded-lg hover:text-primary-600"><ExternalLink className="w-4 h-4" /></button>
                      <button onClick={() => generateReport(p)} className="p-2 border rounded-lg hover:text-green-600"><FileText className="w-4 h-4" /></button>
                      <button
                        onClick={() => setActiveChat(p)}
                        title="Chat with Patient"
                        className="p-2 border rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. History Modal (Same as before) */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold">Medical History: {selectedPatient.name}</h3>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
              {selectedPatient.medicalHistory.slice().reverse().map((visit, idx) => (
                <div key={idx} className="relative pl-8 border-l-2 border-primary-100 pb-2">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-sm" />
                  <p className="text-[10px] font-bold text-primary-500 uppercase">{new Date(visit.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
                  <h4 className="font-bold text-slate-800 text-lg">{visit.diseaseName}</h4>
                  <div className="bg-slate-50 p-4 rounded-xl mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div><p className="font-bold text-slate-400 uppercase text-[10px]">NAMASTE Code</p><p>{visit.NAMC_CODE}</p></div>
                    <div><p className="font-bold text-slate-400 uppercase text-[10px]">ICD-11 Code</p><p>{visit.ICD_11_code || visit.ICD_11_code}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeChat && (
        <ChatWidget
          roomId={activeChat.patientId}
          currentUserRole="Doctor"
          currentUserName={doctor?.name || "Doctor"}
          onClose={() => setActiveChat(null)} // Closes the chat completely
        />
      )}
    </div>
  );
}