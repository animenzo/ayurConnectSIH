import React, { useState } from 'react';
import { Eye, Edit, Check, Languages, Stethoscope } from 'lucide-react';
import { medicalMappings } from '../data/medicalData';

export default function ResultsTable({ filteredData, isLoading,hasSearched }) {
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const openDetails = (mapping) => {
    setSelectedMapping(mapping);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedMapping(null);
    setShowDetails(false);
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
          <span className="text-slate-600">Loading results...</span>
        </div>
      </div>
    );
  }
  if (!hasSearched) {
    return null;
  }
console.log('Dataset item IDs and keys:', medicalMappings.map(item => ({ id: item.id, namasteCode: item.namasteCode })));


  return (
    <>
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">
            Search Results ({filteredData.length} mappings)
          </h3>
        </div>
        
       {filteredData.length > 0 && (
         <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  NAMASTE Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Sanskrit Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  English Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ICD-11 Code
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredData.map((mapping) => (
                <tr key={mapping.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary-600">{mapping.namasteCode}</span>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {mapping.category.split(' ')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{mapping.sanskritName}</span>
                      <span className="text-sm text-slate-500">{mapping.namasteName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{mapping.englishName}</span>
                      <span className="text-sm text-slate-500">{mapping.hindiName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-slate-900">{mapping.icdCode}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`confidence-${mapping.confidenceLevel.toLowerCase()}`}>
                      {mapping.confidenceLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => openDetails(mapping)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit Mapping"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-success-600 hover:text-success-900 transition-colors"
                        title="Validate"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>)}
        
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-300 mb-4">
              <Stethoscope className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No mappings found</h3>
            <p className="text-slate-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedMapping && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Mapping Details</h3>
                  <p className="text-slate-500">Complete information for {selectedMapping.namasteCode}</p>
                </div>
                <button 
                  onClick={closeDetails}
                  className="btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Language Variants
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">NAMASTE:</span> {selectedMapping.namasteName}</div>
                    <div><span className="font-medium">Sanskrit:</span> {selectedMapping.sanskritName}</div>
                    <div><span className="font-medium">English:</span> {selectedMapping.englishName}</div>
                    <div><span className="font-medium">Hindi:</span> {selectedMapping.hindiName}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Classification</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">NAMASTE Code:</span> {selectedMapping.namasteCode}</div>
                    <div><span className="font-medium">ICD-11 Code:</span> {selectedMapping.icdCode}</div>
                    <div><span className="font-medium">Category:</span> {selectedMapping.category}</div>
                    <div><span className="font-medium">Confidence:</span> 
                      <span className={`ml-2 confidence-${selectedMapping.confidenceLevel.toLowerCase()}`}>
                        {selectedMapping.confidenceLevel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Complete Description</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedMapping.fullDescription}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">ICD-11 Description</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedMapping.icdDescription}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Associated Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  
                    <span  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                      {selectedMapping.symptoms}
                    </span>
                  
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Ayurvedic Treatment</h4>
                <p className="text-slate-700 text-sm leading-relaxed">{selectedMapping.ayurvedicTreatment}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500">
                Last updated: {selectedMapping.lastUpdated}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}