import React, { useState, useEffect } from 'react';
import { categoryFilters, confidenceFilters } from '../data/medicalData';
import AdvancedFilters from './AdvancedFilters';
import ResultsTable from './ResultsTable';
import { Download, RefreshCw } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchType, setSearchType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [confidenceFilter, setConfidenceFilter] = useState('All Levels');
  const [filteredData, setFilteredData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false); // NEW: Tracks AI generation status
  const [hasSearched, setHasSearched] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // HELPER FUNCTION: Safely formats MongoDB data for the UI
  const formatDiseaseItem = (item) => {
    const getValid = (val) => {
      if (val == null) return null;
      const cleaned = String(val).trim();
      if (cleaned === '' || cleaned.toUpperCase() === 'N/A' || cleaned.toUpperCase() === 'NA') return null;
      return cleaned;
    };

    const rawICD_11_code = getValid(item.ICD_11_code) || getValid(item.icd11Code);
    const rawIcdTerm = getValid(item.icd11Term) || getValid(item.ICD_11_term);
    const isProcessed = getValid(item.commonDescription) != null;

    return {
      ...item,
      id: item._id,
      namasteCode: getValid(item.NAMC_CODE) || '--',
      sanskritName: getValid(item.NAMC_term_DEVANAGARI) || getValid(item.NAMC_term_diacritical) || getValid(item.NAMC_term) || '--',
      namasteName: getValid(item.NAMC_term) || '--',
      englishName: getValid(item.name_english) || getValid(item.name_english_under_index) || getValid(item.short_definition) || '--',
      shortDefinition: getValid(item.short_definition) || getValid(item.Short_definition) || '--',
      longDefinition: getValid(item.long_definition) || getValid(item.Long_definition) || '--',

      ICD_11_code: rawICD_11_code && rawICD_11_code !== "Not Linked" ? rawICD_11_code : (isProcessed ? 'No Code Found' : 'Not Linked'),
      icdTerm: rawIcdTerm && rawIcdTerm !== "Not Linked" ? rawIcdTerm : '--',
      icdDescription: getValid(item.commonDescription) || 'Pending AI Sync...',
      symptoms: Array.isArray(item.symptoms) ? item.symptoms : [],
      matchingPercentage: Number(item.matchingPercentage) || 0,
      confidenceLevel: Number(item.matchingPercentage) >= 80 ? 'High' : (Number(item.matchingPercentage) >= 50 ? 'Medium' : 'Unmapped'),
      category: getValid(item.ontology_branches) ? String(item.ontology_branches).split(',')[0] : 'Uncategorized',
      primaryIndex: getValid(item.primary_index_related) || '--'
    };
  };

  // 1. SEARCH HOOK (Fast Search Only - No AI)
  useEffect(() => {
    if (
      searchTerm.trim() === '' &&
      selectedCategory === 'All Categories' &&
      confidenceFilter === 'All Levels'
    ) {
      setFilteredData([]);
      setHasSearched(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);

      try {
        const queryParams = new URLSearchParams();
        if (searchTerm.trim()) queryParams.append('q', searchTerm.trim());
        if (searchType !== 'all') queryParams.append('type', searchType);
        if (selectedCategory !== 'All Categories') queryParams.append('category', selectedCategory);
        if (confidenceFilter !== 'All Levels') queryParams.append('confidence', confidenceFilter);

        const response = await fetch(`https://ayurconnect-portal.vercel.app/api/diseases/search?${queryParams.toString()}`);
        const dbResults = await response.json();

        // Format all search results instantly
        setFilteredData(dbResults.map(formatDiseaseItem));
        setHasSearched(true);
      } catch (error) {
        console.error("Error fetching search results:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Back to 300ms because the search is now lightning fast!

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, searchType, selectedCategory, confidenceFilter, refreshKey]);

  // 2. NEW: ON-DEMAND AI TRIGGER (Fires when you click a row)
  const handleRowSelect = async (mapping) => {
    // Open the result immediately so the user can see the Ayurvedic data
    setSelectedRow(mapping);

    // Check if the AI mapping is missing
    if (mapping.ICD_11_code === 'Not Linked' || mapping.ICD_11_code === '--' || mapping.icdDescription === 'Pending AI Sync...') {
      setIsAiLoading(true);

      try {
        // Ping our new backend AI trigger endpoint
        const response = await fetch('https://ayurconnect-portal.vercel.app/api/diseases/trigger-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ NAMC_CODE: mapping.namasteCode }) // Send the exact code!
        });

        if (response.ok) {
          const updatedDiseaseDb = await response.json();
          const updatedMapping = formatDiseaseItem(updatedDiseaseDb);

          // Update the open modal dynamically with the new AI data
          setSelectedRow(updatedMapping);

          // Also update the row in the dropdown list behind the scenes
          setFilteredData(prevData => prevData.map(item => item.id === mapping.id ? updatedMapping : item));
        }
      } catch (error) {
        console.error("Failed to trigger AI on demand:", error);
      } finally {
        setIsAiLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    if (hasSearched) setRefreshKey(prev => prev + 1);
  };

  const handleExport = () => {
    // HELPER: Safely escapes commas and quotes so paragraphs don't break Excel columns!
    const escapeCSV = (str) => {
      if (str == null) return '""';
      const stringified = String(str);
      // CSV standard: Wrap in quotes, and replace internal quotes with double-quotes
      return `"${stringified.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      // 1. Added the new AI Headers
      [
        'NAMASTE Code',
        'Sanskrit Name',
        'English Name',
        'ICD-11 Code',
        'ICD-11 Term',
        'Unified Clinical Description', // NEW
        'Match Confidence (%)',         // NEW
        'Category'
      ],
      // 2. Added the new AI Data Fields safely mapped
      ...filteredData.map((item) => [
        escapeCSV(item.namasteCode),
        escapeCSV(item.sanskritName),
        escapeCSV(item.englishName),
        escapeCSV(item.ICD_11_code),
        escapeCSV(item.icdTerm),
        escapeCSV(item.icdDescription),     // Generates the AI paragraph safely
        escapeCSV(item.matchingPercentage), // Adds the 0-100 score
        escapeCSV(item.category),
      ]),
    ].map((row) => row.join(',')).join('\n');

    // Added the UTF-8 BOM (\uFEFF) so Excel reads Devanagari Sanskrit characters perfectly!
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'namaste-icd11-live-mappings.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
          <button onClick={handleExport} className="btn-secondary" disabled={filteredData.length === 0}>
            <Download className="w-4 h-4" /> Export Results
          </button>
          <button onClick={handleRefresh} className="btn-primary" disabled={!hasSearched}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      <AdvancedFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchType={searchType}
        setSearchType={setSearchType}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        confidenceFilter={confidenceFilter}
        setConfidenceFilter={setConfidenceFilter}
        categoryFilters={categoryFilters}
        confidenceFilters={confidenceFilters}
        resultCount={filteredData.length}
        filteredData={filteredData}

        // WIRE UP OUR NEW ON-DEMAND CLICK HANDLER HERE
        onSelectResult={handleRowSelect}

        onClearSelection={() => setSelectedRow(null)}
      />

      {/* Pass both loading states down to the table so the UI can show spinners if needed */}
      <ResultsTable
        tableData={selectedRow ? [selectedRow] : []}
        isLoading={isLoading || isAiLoading}
      />
    </div>
  );
}