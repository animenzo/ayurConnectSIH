import React, { useRef } from 'react';
import { Download, Printer, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PatientReport({ patient, visitData, doctor }) {
  const reportRef = useRef();

  const generatePDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${patient.name}_Report_${visitData.date.split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generatePDF}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" /> Download Medical Report
      </button>

      {/* --- HIDDEN PRINTABLE AREA --- */}
      <div className="absolute left-[-9999px]"> {/* Move off-screen */}
        <div
          ref={reportRef}
          className="w-[210mm] p-12 bg-white text-slate-900"
          style={{ fontFamily: 'serif' }}
        >
          {/* Header */}
          <div className="border-b-2 border-primary-600 pb-6 mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary-700">{doctor.clinicName}</h1>
              <p className="text-lg font-semibold">{doctor.name}</p>
              <p className="text-sm text-slate-500">{doctor.specialization} | ID: {doctor.doctorId}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>{new Date().toLocaleDateString()}</p>
              <p>Ayur-ICD Integration Portal</p>
            </div>
          </div>

          {/* Patient Info Table */}
          <div className="grid grid-cols-2 gap-8 mb-10 bg-slate-50 p-6 rounded-lg">
            <div>
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">Patient Details</p>
              <p className="text-xl font-bold">{patient.name}</p>
              <p className="text-sm text-slate-600">ID: {patient.patientId} | Age: {patient.age} | {patient.gender}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase font-bold text-slate-400 mb-1">Contact</p>
              <p className="text-sm text-slate-600">{patient.contact}</p>
              <p className="text-sm text-slate-600">{patient.email}</p>
            </div>
          </div>

          {/* Clinical Diagnosis (The Core of your App) */}
          <div className="mb-10 space-y-4">
            <h3 className="text-lg font-bold border-b pb-2">Clinical Diagnosis & Mapping</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded border">
                <p className="text-[10px] font-bold text-slate-400 uppercase">NAMC Term</p>
                <p className="font-bold">{visitData.diseaseName}</p>
                <p className="text-xs font-mono text-primary-600">{visitData.NAMC_CODE}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded border col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">ICD-11 Classification</p>
                <p className="font-bold">Code: {visitData.ICD_11_code}</p>
                <p className="text-xs italic text-slate-600">Integrated Medical Classification</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Symptoms Identified</p>
              <div className="flex flex-wrap gap-2">
                {visitData.symptoms.map((s, i) => (
                  <span key={i} className="text-sm font-medium px-2 py-0.5 border rounded">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Clinical Reasoning</p>
              <p className="text-sm leading-relaxed text-slate-700">{visitData.diagnosis}</p>
            </div>
          </div>

          {/* Prescription Table */}
          <div className="mb-10">
            <h3 className="text-lg font-bold border-b pb-2 mb-4">Treatment Plan (Rx)</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-xs font-bold uppercase">
                  <th className="p-3 border">Medicine / Intervention</th>
                  <th className="p-3 border">Dosage & Frequency</th>
                  <th className="p-3 border">Duration</th>
                </tr>
              </thead>
              <tbody>
                {visitData.medicines.map((m, i) => (
                  <tr key={i} className="text-sm">
                    <td className="p-3 border font-bold">{m.name}</td>
                    <td className="p-3 border">{m.dosage}</td>
                    <td className="p-3 border">{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer / Signature */}
          <div className="mt-20 flex justify-between items-end border-t pt-10">
            <div className="text-[10px] text-slate-400 max-w-[300px]">
              This report is generated via the Ayur-ICD Digital Health Platform. It combines traditional Ayurvedic terminology with WHO ICD-11 standards for global interoperability.
            </div>
            <div className="text-center">
              <div className="w-40 border-b border-slate-900 mb-2"></div>
              <p className="text-sm font-bold">{doctor.name}</p>
              <p className="text-[10px] text-slate-500 uppercase">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}