import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function AdvancedFilters({ 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory,
  confidenceFilter, 
  setConfidenceFilter,
  categoryFilters,
  confidenceFilters,
  resultCount 
}) {
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setConfidenceFilter('All Levels');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All Categories' || confidenceFilter !== 'All Levels';

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-100 rounded-lg">
          <Filter className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">Advanced Filters</h3>
          <p className="text-sm text-slate-500">Refine your search with multiple criteria</p>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Terms
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by any field, Sanskrit/English names..."
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Category Filter
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            {categoryFilters.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confidence Level
          </label>
          <select
            value={confidenceFilter}
            onChange={(e) => setConfidenceFilter(e.target.value)}
            className="input-field"
          >
            {confidenceFilters.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-700">
            Results: <span className="text-primary-600 font-semibold">{resultCount}</span> mappings found
          </span>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Active filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedCategory !== 'All Categories' && (
                <span className="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs">
                  {selectedCategory}
                </span>
              )}
              {confidenceFilter !== 'All Levels' && (
                <span className="px-2 py-1 bg-warning-100 text-warning-700 rounded-full text-xs">
                  {confidenceFilter} confidence
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}