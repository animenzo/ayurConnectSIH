// SearchPage.jsx
import React, { useState, useEffect } from 'react';
import { medicalMappings, categoryFilters, confidenceFilters } from '../data/medicalData';
import AdvancedFilters from './AdvancedFilters';
import ResultsTable from './ResultsTable';
import { Download, RefreshCw } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [confidenceFilter, setConfidenceFilter] = useState('All Levels');
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Reset if no filters applied
    if (
      searchTerm.trim() === '' &&
      selectedCategory === 'All Categories' &&
      confidenceFilter === 'All Levels'
    ) {
      setFilteredData([]);  // no data shown by default
      setHasSearched(false);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let filtered = medicalMappings;

      if (searchTerm.trim() !== '') {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.namasteCode.toLowerCase().includes(lowerSearch) ||
            item.namasteName.toLowerCase().includes(lowerSearch) ||
            item.sanskritName.toLowerCase().includes(lowerSearch) ||
            item.englishName.toLowerCase().includes(lowerSearch) ||
            item.hindiName.toLowerCase().includes(lowerSearch) ||
            item.icdCode.toLowerCase().includes(lowerSearch) ||
            item.icdDescription.toLowerCase().includes(lowerSearch) ||
            item.fullDescription.toLowerCase().includes(lowerSearch) ||
            item.symptoms.
              toLowerCase().includes(lowerSearch)
            
        );
      }

      
      if (selectedCategory !== 'All Categories') {
        const lowerCategory = selectedCategory.toLowerCase();
        filtered = filtered.filter((item) => {
          const categoryMatch = item.category?.toLowerCase().includes(lowerCategory);
          const descriptionMatch = item.fullDescription?.toLowerCase().includes(lowerCategory);
          const symptomMatch = item.symptoms?.some(symptom =>
            symptom.toLowerCase().includes(lowerCategory)
          );
          return categoryMatch || descriptionMatch || symptomMatch;
        });
      }

      if (confidenceFilter !== 'All Levels') {
        filtered = filtered.filter(
          (item) => item.confidenceLevel === confidenceFilter
        );
      }

      setFilteredData(filtered);
      setHasSearched(true); // mark as user has searched/filter changed
      setIsLoading(false);
    }, 300);
  }, [searchTerm, selectedCategory, confidenceFilter]);

  const handleExport = () => {
    const csvContent = [
      ['NAMASTE Code', 'Sanskrit Name', 'English Name', 'ICD-11 Code', 'Description', 'Confidence', 'Category'],
      ...filteredData.map((item) => [
        item.namasteCode,
        item.sanskritName,
        item.englishName,
        item.icdCode,
        item.icdDescription,
        item.confidenceLevel,
        item.category,
      ]),
    ].map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namaste-icd11-mappings.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Advanced Search & Mapping</h2>
          <p className="text-slate-500 mt-1">
            Comprehensive search across NAMASTE and ICD-11 medical terminologies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="w-4 h-4" />
            Export Results
          </button>
          <button className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      <AdvancedFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        confidenceFilter={confidenceFilter}
        setConfidenceFilter={setConfidenceFilter}
        categoryFilters={categoryFilters}
        confidenceFilters={confidenceFilters}
        resultCount={filteredData.length}
      />

      <ResultsTable
        filteredData={filteredData}
        isLoading={isLoading}
        hasSearched={hasSearched}
      />
    </div>
  );
}
