import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, BookOpen, Languages } from 'lucide-react';

export default function QuickSearch({ setActivePage }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced Search Effect
  useEffect(() => {
    // If search is empty or too short, clear results and stop
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const fetchQuickResults = async () => {
      setIsSearching(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('q', searchTerm.trim());

        // Fetch from the backend API
        const response = await fetch(`https://ayurconnect-portal.onrender.com/api/diseases/search?${queryParams.toString()}`);
        const dbResults = await response.json();

        // ADAPTER: Translate MongoDB schema to QuickSearch UI schema
        const formattedResults = dbResults.map(item => {
          const rawICD_11_code = item.ICD_11_code || item.icd11Code;
          const confNum = Number(item.matchingPercentage) || 0;
          let confLevel = 'Unmapped';
          if (confNum >= 80) confLevel = 'High';
          else if (confNum >= 50) confLevel = 'Medium';
          else if (confNum > 0) confLevel = 'Low';

          return {
            id: item._id,
            namasteCode: item.NAMC_CODE || '--',
            ICD_11_code: rawICD_11_code && rawICD_11_code !== "Not Linked" ? rawICD_11_code : 'Unmapped',
            confidenceLevel: confLevel,
            sanskritName: item.NAMC_term_DEVANAGARI || item.NAMC_term_diacritical || '--',
            englishName: item.name_english || item.short_definition || '--',
            // Fallback for Hindi using the standard NAMC term if Devanagari is used for Sanskrit
            hindiName: item.NAMC_term || '--',
            fullDescription: item.short_definition || item.long_definition || '--',
            category: item.ontology_branches ? String(item.ontology_branches).split(',')[0] : 'Uncategorized',
          };
        });

        // Limit quick search to top 5-10 results to keep UI clean
        setSearchResults(formattedResults.slice(0, 10));
      } catch (error) {
        console.error("Quick Search Error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Wait 400ms after the user stops typing before hitting the backend
    const debounceTimer = setTimeout(fetchQuickResults, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const getLanguageInfo = (mapping) => {
    const languages = [];
    if (mapping.sanskritName && mapping.sanskritName !== '--') {
      languages.push({ lang: 'Sanskrit', name: mapping.sanskritName });
    }
    if (mapping.hindiName && mapping.hindiName !== '--' && mapping.hindiName !== mapping.sanskritName) {
      languages.push({ lang: 'Ayurvedic Term', name: mapping.hindiName });
    }
    if (mapping.englishName && mapping.englishName !== '--') {
      languages.push({ lang: 'English', name: mapping.englishName });
    }
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
          <p className="text-sm text-slate-500">Search across NAMASTE codes, Sanskrit terms, and English terminology</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by disease name, NAMASTE code, or ICD-11 code..."
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
            <span className="text-sm text-slate-500">
              {searchResults.length} {searchResults.length === 10 ? 'top matches' : 'found'}
            </span>
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
                          {mapping.ICD_11_code}
                        </span>
                        <span className={`confidence-${mapping.confidenceLevel.toLowerCase()}`}>
                          {mapping.confidenceLevel} Match
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




                      </div>
                    </div>

                    <button
                      className="btn-secondary text-xs ml-4 whitespace-nowrap"
                      onClick={() => setActivePage('search')}
                    >
                      <ArrowRight className="w-3 h-3 mr-1 inline" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !isSearching && (
              <div className="text-center py-8 text-slate-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                <p>No results found for "{searchTerm}"</p>
                <p className="text-sm mt-1">Try searching with a different term</p>
              </div>
            )
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
          <h4 className="font-medium text-slate-900 mb-2">Live Database Search</h4>
          <p className="text-sm text-slate-600 mb-4">
            Search in Sanskrit, English, or by Code. Our system queries the live MongoDB database instantly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
              <div className="font-medium text-slate-700 mb-1">Try Terms:</div>
              <div className="text-slate-500">jvara, kasa, gulma</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
              <div className="font-medium text-slate-700 mb-1">Try English:</div>
              <div className="text-slate-500">fever, cough, asthma</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
              <div className="font-medium text-slate-700 mb-1">Try Codes:</div>
              <div className="text-slate-500">AAA-2.3, CA23</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}