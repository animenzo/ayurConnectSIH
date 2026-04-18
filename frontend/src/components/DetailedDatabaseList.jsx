import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react';

export default function DetailedDatabaseList() {
  const [dbData, setDbData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch Data from your MongoDB Backend
  useEffect(() => {
    const fetchAllCodes = async () => {
      try {
        const response = await fetch('https://ayurconnect-portal.onrender.com/api/diseases');
        const data = await response.json();

        // PROTECT THE FRONTEND: Only set the data if it is a real array
        if (Array.isArray(data)) {
          setDbData(data);
        } else if (data && data.diseases && Array.isArray(data.diseases)) {
          // Just in case your backend sends it wrapped in an object like { diseases: [...] }
          setDbData(data.diseases);
        } else {
          console.error("Backend sent invalid data:", data);
          setDbData([]); // Fallback to an empty array so .filter() doesn't crash
        }

      } catch (error) {
        console.error("Failed to fetch database records:", error);
        setDbData([]); // Fallback on network error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCodes();
  }, []);

  // 2. Filter Logic (Searches across multiple fields)
  // 2. Universal Filter Logic
  const filteredData = dbData.filter(item => {
    // If search is empty, show EVERYTHING
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Check every single piece of text inside the database item
    return Object.values(item).some(value =>
      value && String(value).toLowerCase().includes(searchLower)
    );
  });

  // 3. Pagination Math
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = filteredData.slice(startIndex, startIndex + entriesPerPage);

  // Reset to page 1 if the user types a new search or changes entries per page
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">

      {/* HEADER SECTION */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800">Complete Morbidity Codes Database - Detailed List</h2>
      </div>

      {/* CONTROLS SECTION (Search & Entries) */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search Code, Term, or English..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
        </div>

        {/* Entries Per Page Dropdown */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>entries per page</span>
        </div>

        {/* Dynamic Showing Text */}
        <div className="text-sm text-slate-600 font-medium">
          Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries.toLocaleString()} entries
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100/50 text-slate-600 font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 w-16">Sr No.</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Name Devnagari</th>
              <th className="px-6 py-4">Name Term</th>
              <th className="px-6 py-4 w-20">Name English</th>
              {/* <th className="px-6 py-4">Linked Status</th>
              <th className="px-6 py-4">Confidence</th> */}
              <th className="px-6 py-4 max-w-xs">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-medium animate-pulse">
                  Loading database records...
                </td>
              </tr>
            ) : currentEntries.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-medium">
                  No records found matching your search.
                </td>
              </tr>
            ) : (
              currentEntries.map((item, index) => {
                // Determine linked status based on your data structure
                const isLinked = item.ICD_11_code && item.ICD_11_code !== '';

                return (
                  <tr key={item._id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{startIndex + index + 1}</td>

                    <td className="px-6 py-4 font-bold text-slate-800">{item.NAMC_CODE || '-'}</td>

                    {/* Note: Update these property names if your database schema uses different keys for devnagari/english */}
                    <td className="px-6 py-4 font-medium text-slate-700">{item.NAMC_term_DEVANAGARI || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.NAMC_term || '-'}</td>
                    <td className="px-6 py-4 text-slate-600">{item.name_english || '-'}</td>

                    {/* Linked Status Column */}
                    {/* <td className="px-6 py-4">
                      {isLinked ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Linked
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 ml-1"></span> Not Linked
                        </div>
                      )}
                    </td> */}

                    {/* Confidence Column */}
                    {/* <td className="px-6 py-4">
                      <span className={item.confidence === 'High' ? 'text-emerald-600 font-bold' : 'text-slate-800 font-bold'}>
                        {item.matchingPercentage || (isLinked ? 'High' : 'Low')}
                      </span>
                    </td> */}

                    {/* Description with truncation */}
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500" title={item.diagnosis || item.description || '-'}>
                      {item.commonDescription || item.long_definition || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronFirst className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        </button>

        {/* Page Indicator */}
        <div className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg text-sm shadow-sm">
          {currentPage}
        </div>

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4 text-slate-600" />
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLast className="w-4 h-4 text-slate-600" />
        </button>
      </div>

    </div>
  );
}