import React, { useState } from 'react';
import { Search, ArrowRight, BookOpen, Languages } from 'lucide-react';
import { medicalMappings, synonymsMap } from '../data/medicalData';

export default function QuickSearch({ setActivePage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const lowerTerm = term.toLowerCase();
    
    // Enhanced search with bidirectional language support
    const results = medicalMappings.filter(mapping => {
      const searchFields = [
        mapping.namasteCode,
        mapping.namasteName,
        mapping.sanskritName,
        mapping.englishName,
        mapping.hindiName,
        mapping.icdCode,
        mapping.icdDescription,
        mapping.fullDescription,
        ...mapping.symptoms,
      ].map(field => field?.toLowerCase() || '');
      
      // Check synonyms for bidirectional search
      const synonymMatches = Object.keys(synonymsMap).some(key => {
        if (key.toLowerCase().includes(lowerTerm)) {
          return synonymsMap[key].some(synonym => 
            searchFields.some(field => field.includes(synonym.toLowerCase()))
          );
        }
        return false;
      });
      
      return searchFields.some(field => field.includes(lowerTerm)) || synonymMatches;
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    performSearch(value);
  };

  const getLanguageInfo = (mapping) => {
    const languages = [];
    if (mapping.sanskritName !== mapping.englishName) {
      languages.push({ lang: 'Sanskrit', name: mapping.sanskritName });
    }
    if (mapping.hindiName !== mapping.englishName) {
      languages.push({ lang: 'Hindi', name: mapping.hindiName });
    }
    languages.push({ lang: 'English', name: mapping.englishName });
    return languages;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Search className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Intelligent Search</h3>
          <p className="text-sm text-slate-500">Search across NAMASTE codes, Sanskrit/Hindi names, and English terminology</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by disease name in any language, NAMASTE code, or ICD-11 code..."
          className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {searchTerm && (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Search Results</h4>
            <span className="text-sm text-slate-500">{searchResults.length} found</span>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((mapping) => (
                <div key={mapping.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {mapping.namasteCode}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                          {mapping.icdCode}
                        </span>
                        <span className={`confidence-${mapping.confidenceLevel.toLowerCase()}`}>
                          {mapping.confidenceLevel}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Languages className="w-4 h-4 text-slate-400" />
                          <div className="flex flex-wrap gap-2">
                            {getLanguageInfo(mapping).map((lang, idx) => (
                              <span key={idx} className="text-sm">
                                <span className="font-medium text-slate-600">{lang.lang}:</span>{' '}
                                <span className="text-slate-900">{lang.name}</span>
                                {idx < getLanguageInfo(mapping).length - 1 && <span className="text-slate-400 ml-2">•</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-600 line-clamp-2">{mapping.fullDescription}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <BookOpen className="w-3 h-3" />
                          <span>{mapping.category}</span>
                          <span>•</span>
                          <span>{mapping.symptoms.length} symptoms listed</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="btn-secondary text-xs" onClick={() => setActivePage('search')}>
                      <ArrowRight className="w-3 h-3" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <p>No results found for "{searchTerm}"</p>
              <p className="text-sm">Try searching with Sanskrit, Hindi, or English names</p>
            </div>
          )}
        </div>
      )}

      {!searchTerm && (
        <div className="bg-slate-50 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-2xl">🔍</div>
            <div className="text-2xl">🌐</div>
            <div className="text-2xl">📚</div>
          </div>
          <h4 className="font-medium text-slate-900 mb-2">Smart Multilingual Search</h4>
          <p className="text-sm text-slate-600 mb-4">
            Search in Sanskrit, Hindi, or English. Our system automatically finds related terms across all languages.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white rounded-lg p-3">
              <div className="font-medium text-slate-700 mb-1">Try Sanskrit:</div>
              <div className="text-slate-500">ज्वर, कास, गुल्म</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="font-medium text-slate-700 mb-1">Try English:</div>
              <div className="text-slate-500">fever, cough, diabetes</div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="font-medium text-slate-700 mb-1">Try Codes:</div>
              <div className="text-slate-500">AYU-001, TM26.SF20</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}