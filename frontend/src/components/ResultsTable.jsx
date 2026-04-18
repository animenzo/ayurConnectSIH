import React, { useState, useRef } from 'react';
import { Eye, Edit, Languages, Stethoscope, Activity, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ResultsTable({
  tableData,
  isLoading
}) {
  const [modalItem, setModalItem] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Create a reference to the modal content we want to turn into a PDF
  const modalContentRef = useRef(null);

  // --- PDF GENERATION FUNCTION ---
  const handleDownloadPDF = async () => {
    if (!modalContentRef.current) return;
    setIsDownloading(true);

    try {
      // 1. Take a high-quality "screenshot" of the HTML div
      const canvas = await html2canvas(modalContentRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff' // Ensure background is white
      });

      // 2. Convert to Image
      const imgData = canvas.toDataURL('image/png');

      // 3. Create PDF document (A4 size, Portrait)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // 4. Add image and save
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`NAMASTE-Mapping-${modalItem.namasteCode}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8 mt-6">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          <span className="text-slate-600">Loading details from database...</span>
        </div>
      </div>
    );
  }

  if (!tableData || tableData.length === 0) {
    return (
      <div className="card text-center py-12 mt-6 bg-slate-50 border border-slate-200 border-dashed">
        <div className="text-slate-300 mb-3">
          <Stethoscope className="w-10 h-10 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-slate-900">Waiting for selection</h3>
        <p className="text-slate-500 text-sm">Search and select a term from the dropdown to view its detailed mapping.</p>
      </div>
    );
  }

  return (
    <>
      <div className="card overflow-hidden mt-6 border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Selected Database Record</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Code & Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Namaste Term</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">English Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ICD-11 Mapping</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {tableData.map((mapping) => (
                <tr key={mapping.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-primary-700">{mapping.namasteCode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-sm">{mapping.sanskritName}</span>
                      <span className="text-xs text-slate-500">{mapping.namasteName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900 text-sm max-w-[200px] truncate block" title={mapping.englishName}>
                      {mapping.englishName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {mapping.ICD_11_code}
                      </span>
                      {mapping.icdTerm !== '--' && (
                        <span className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5" title={mapping.icdTerm}>
                          {mapping.icdTerm}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setModalItem(mapping)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="View Full Clinical Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 bg-slate-50 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                        title="Edit Mapping Manually"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================== */}
      {/* THE DATABASE DETAILS MODAL                         */}
      {/* ================================================== */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">

            {/* Header with action buttons - Excluded from PDF capture */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md p-6 border-b border-slate-200 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 font-mono font-bold text-sm rounded">
                    {modalItem.namasteCode}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {modalItem.sanskritName}
                  </h3>
                </div>
                <p className="text-slate-500 font-medium">
                  {modalItem.englishName}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* 🚨 NEW PDF DOWNLOAD BUTTON */}
                <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-5 py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  {isDownloading ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-primary-700 border-t-transparent"></span>
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isDownloading ? 'Generating...' : 'Export PDF'}
                </button>

                <button
                  onClick={() => setModalItem(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Close View
                </button>
              </div>
            </div>

            {/* 🚨 ADDED ref={modalContentRef} HERE so we capture everything inside this div */}
            <div ref={modalContentRef} className="p-8 space-y-8 bg-white">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Languages className="w-5 h-5 text-primary-600" /> NAMASTE Code: {modalItem.namasteCode}
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b border-slate-200 pb-2"><span className="font-semibold text-slate-500">NAMASTE Term:</span> <span className="font-medium text-slate-900">{modalItem.namasteName}</span></div>
                    <div className="flex justify-between border-b border-slate-200 pb-2"><span className="font-semibold text-slate-500">Sanskrit / Devanagari:</span> <span className="font-medium text-slate-900">{modalItem.sanskritName}</span></div>
                    <div className="flex justify-between pb-1"><span className="font-semibold text-slate-500">English Name:</span> <span className="font-medium text-slate-900">{modalItem.englishName}</span></div>
                  </div>
                </div>

                <div className="bg-green-50/50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-green-600" /> ICD-11 Mapping
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">ICD11 Code</span>
                      <span className="font-mono text-xl font-bold text-slate-900 bg-white px-3 py-1 rounded border border-slate-200 shadow-sm">
                        {modalItem.ICD_11_code}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Official ICD-11 Term</span>
                      <span className="text-lg font-medium text-slate-900">
                        {/* FIX: Changed from englishName to icdTerm! */}
                        {modalItem.icdTerm}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Classical Definition</h4>
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    {modalItem.shortDefinition !== '--' && (
                      <p className="text-slate-800 text-md font-medium border-l-4 border-primary-400 pl-3">
                        {modalItem.englishName}
                      </p>
                    )}
                    <p className="text-slate-600 text-md leading-relaxed whitespace-pre-wrap">
                      {modalItem.commonDescription}
                    </p>

                    {/* SAFELY ADDED SYMPTOMS SECTION */}
                    {modalItem.symptoms && modalItem.symptoms.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-rose-500" /> Key Clinical Symptoms
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {modalItem.symptoms.map((symptom, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-sm font-semibold shadow-sm transition-all hover:bg-rose-100"
                            >
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* END OF SYMPTOMS SECTION */}

                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}