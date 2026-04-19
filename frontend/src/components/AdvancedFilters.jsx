import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function AdvancedFilters({
  searchTerm, setSearchTerm,
  searchType, setSearchType,
  selectedCategory, setSelectedCategory,
  confidenceFilter, setConfidenceFilter,
  categoryFilters, confidenceFilters,
  resultCount,
  filteredData = [],
  onSelectResult,
  onClearSelection
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() !== '') {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
    if (onClearSelection) onClearSelection();
  };

  const handleResultClick = (mapping) => {
    let displayName = mapping.sanskritName !== '--' ? mapping.sanskritName : mapping.englishName;
    if (displayName === '--') displayName = mapping.namasteName;

    setShowDropdown(false);
    onSelectResult(mapping);
  };

  return (
    <div className="card p-6 border border-slate-200 shadow-sm relative z-40">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Filter className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">Search & Integration</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Search Term</label>
          <div className="flex gap-2">

            <div className="relative flex-1" ref={dropdownRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => { if (searchTerm) setShowDropdown(true); }}
                className="input-field pl-10 border-slate-200 w-full focus:ring-primary-500 focus:border-primary-500"
                placeholder="Type to search..."
                autoComplete="off"
              />

              {showDropdown && searchTerm && (
                <div className="absolute top-[105%] left-0 w-full md:w-[150%] bg-white border border-slate-300 shadow-xl rounded-md z-50 max-h-64 overflow-y-auto">
                  {filteredData.length > 0 ? (
                    <ul className="divide-y divide-slate-100">
                      {filteredData.map((mapping) => (
                        <li
                          key={mapping.id}
                          onClick={() => handleResultClick(mapping)}
                          className="px-4 py-3 hover:bg-primary-50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{mapping.sanskritName}</span>
                            <span className="text-slate-500 text-xs ml-2">({mapping.namasteName})</span>
                            
                            {/* THE FIX: Only show ICD code if it exists and isn't "Not Linked" */}
                            {mapping.ICD_11_code && mapping.ICD_11_code !== 'Not Linked' && mapping.ICD_11_code !== '--' && (
                              <span className="text-slate-500 text-xs ml-2">({mapping.ICD_11_code})</span>
                            )}

                          </div>
                          <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2 py-1 rounded">
                            {mapping.namasteCode}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                      No results found in database.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input-field border-slate-200">
            {categoryFilters.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Confidence Level</label>
          <select value={confidenceFilter} onChange={(e) => setConfidenceFilter(e.target.value)} className="input-field border-slate-200">
            {confidenceFilters.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}