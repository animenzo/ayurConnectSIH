import React, { useState, useEffect } from 'react';
import { History, Download, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

// 1. CRITICAL IMPORTS ADDED HERE
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ChatWidget from './ChatWidget';

export default function PatientDashboard({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyHistory();
  }, []);

  const fetchMyHistory = async () => {
    try {
      const res = await fetch('https://ayurconnect-portal.onrender.com/api/patients/my-history', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const data = await res.json();
      setHistory(data.medicalHistory || []);
    } catch (err) {
      toast.error("Could not load history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (record) => {
    try {
      const doc = new jsPDF();

      // 1. Header
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text("MEDICAL CONSULTATION REPORT", 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Issued by: Dr. ${record.doctorName || 'Unknown'}`, 105, 28, { align: 'center' });
      doc.line(20, 32, 190, 32);

      // 2. Patient & Record Info
      autoTable(doc, {
        startY: 40,
        head: [['Patient ID', 'Name', 'Date of Visit']],
        body: [[user.patientId, user.name, new Date(record.date).toLocaleDateString()]],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
      });

      // 3. Clinical Details (NAMASTE & ICD)
      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text("Clinical Diagnosis:", 20, doc.lastAutoTable.finalY + 15);

      // Safety check for symptoms array
      const symptomsList = record.symptoms && record.symptoms.length > 0
        ? record.symptoms.join(', ')
        : 'None recorded';

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        body: [
          ["Disease Name", record.diseaseName || "N/A"],
          ["NAMASTE Code", record.NAMC_CODE || "N/A"],
          ["ICD-11 Code", record.ICD_11_code || "N/A"],
          ["Symptoms", symptomsList],
          ["Diagnosis Note", record.diagnosis || "None recorded"]
        ],
        theme: 'striped',
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
      });

      // 4. Medication Table
      doc.setFontSize(12);
      doc.text("Prescribed Medication:", 20, doc.lastAutoTable.finalY + 15);

      // Safety check for medicines array
      const medsBody = record.medicines && record.medicines.length > 0
        ? record.medicines.map(m => [m.name, m.dosage, m.duration])
        : [['No medication prescribed', '-', '-']];

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Medicine', 'Dosage', 'Duration']],
        body: medsBody,
        headStyles: { fillColor: [16, 185, 129] }
      });

      // Clean file name
      const safeFileName = (record.diseaseName || 'Visit').replace(/\s+/g, '_');
      doc.save(`Medical_Report_${safeFileName}.pdf`);

      toast.success("Report downloaded successfully!");
    } catch (err) {
      console.error("PDF Generation Error:", err);
      toast.error("Failed to generate report. Missing data.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* 1. ID Card Section */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-primary-600 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest">My Global Health ID</h2>
          <div className="my-6 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <span className="text-5xl font-black text-primary-700 font-mono tracking-tighter">
              {user.patientId}
            </span>
          </div>
          <p className="text-slate-600 font-medium">Show this to your doctor to sync records</p>
        </div>
      </div>

      {/* 2. Shared Medical Records Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <History className="text-primary-600" /> My Medical Records
        </h3>

        {loading ? (
          <div className="p-20 text-center animate-pulse text-slate-400">Fetching records...</div>
        ) : history.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-medium">No records shared by your doctor yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {/* 2. ADDED slice().reverse() to show newest records at the top */}
            {history.slice().reverse().map((record, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center hover:border-primary-300 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary-500 uppercase">{new Date(record.date).toLocaleDateString()}</p>
                    <h4 className="text-xl font-bold">{record.diseaseName || 'Clinical Visit'}</h4>
                    <p className="text-sm text-slate-500">Dr. {record.doctorName || 'Unknown'}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleViewReport(record)}
                  className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-primary-600 transition-colors shadow-md"
                >
                  <Download className="w-4 h-4" /> View Report
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <ChatWidget
        roomId={user.patientId}
        currentUserRole="Patient"
        currentUserName={user.name}
      />
    </div>
  );
}