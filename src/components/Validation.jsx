import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Search, FileText } from 'lucide-react';
import { medicalMappings } from '../data/medicalData';

export default function Validation() {
  const [selectedCode, setSelectedCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = () => {
    if (!selectedCode) return;
    setIsValidating(true);
    setTimeout(() => {
      const mapping = medicalMappings.find(m => m.namasteCode === selectedCode);
      if (mapping) {
        const isValid = mapping.confidenceLevel === 'High';
        setValidationResult({
          ...mapping,
          isValid,
          validationMessage: isValid ? 'Code validated successfully with high confidence.' : 'Code requires review - medium/low confidence.',
          matchScore: isValid ? 0.95 : 0.75
        });
      } else {
        setValidationResult({
          isValid: false,
          validationMessage: 'Code not found in NAMASTE-ICD11 mappings.',
          matchScore: 0
        });
      }
      setIsValidating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Code Validation</h2>
          <p className="text-slate-500 mt-1">Validate NAMASTE codes against ICD-11 mappings and confidence levels</p>
        </div>
        <button className="btn-primary">
          <FileText className="w-4 h-4" />
          Export Validation Log
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Validate Code</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">NAMASTE Code</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={selectedCode}
                  onChange={(e) => setSelectedCode(e.target.value.toUpperCase())}
                  placeholder="Enter NAMASTE code (e.g., AYU-001)"
                  className="input-field pl-10"
                />
              </div>
            </div>
            <button 
              onClick={handleValidate}
              disabled={!selectedCode || isValidating}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Validating...
                </div>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Validate Code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Validation Results</h3>
          {validationResult ? (
            <div className={`p-4 rounded-lg ${
              validationResult.isValid ? 'bg-success-50 border border-success-200' : 'bg-danger-50 border border-danger-200'
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {validationResult.isValid ? (
                  <CheckCircle className="w-5 h-5 text-success-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-danger-600" />
                )}
                <h4 className="font-medium text-slate-900">
                  {validationResult.namasteCode || 'Unknown Code'}
                </h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">{validationResult.validationMessage}</p>
              {validationResult.matchScore && (
                <div className="text-xs text-slate-500 mb-3">
                  Match Score: {(validationResult.matchScore * 100).toFixed(1)}%
                </div>
              )}
              {validationResult.englishName && (
                <div className="text-sm">
                  <span className="font-medium">English:</span> {validationResult.englishName} ({validationResult.confidenceLevel})
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Select a code and click validate to see results</p>
            </div>
          )}
        </div>
      </div>

      {validationResult && validationResult.fullDescription && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Information</h3>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">ICD-11 Mapping</h4>
              <p className="text-slate-600">{validationResult.icdCode} - {validationResult.icdDescription}</p>
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Description</h4>
              <p className="text-slate-700 leading-relaxed">{validationResult.fullDescription}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <h4 className="font-medium text-slate-900 mb-2">Symptoms:</h4>
              {validationResult.symptoms.map((symptom, index) => (
                <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                  {symptom}
                </span>
              ))}
            </div>
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Ayurvedic Treatment</h4>
              <p className="text-slate-700">{validationResult.ayurvedicTreatment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}