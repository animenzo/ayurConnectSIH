import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

export default function RecentMappings({ setActivePage }) {
  const [recentMappings, setRecentMappings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentMappings = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/diseases/recent');
        const dbResults = await response.json();

        // Adapter: Translate MongoDB fields to match your UI structure
        const formattedData = dbResults.map(item => ({
          id: item._id,
          namasteCode: item.NAMC_CODE || 'N/A',
          englishName: item.short_definition || 'N/A',
          namasteName: item.NAMC_term || 'N/A',
          ICD_11_code: item.ICD_11_code || 'Pending',
          // Determine confidence label based on DeepSeek's matching percentage
          confidenceLevel: item.matchingPercentage > 80 ? 'High' : (item.matchingPercentage > 50 ? 'Medium' : 'Low'),
          // Format the MongoDB timestamp
          lastUpdated: new Date(item.updatedAt || Date.now()).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })
        }));

        setRecentMappings(formattedData);
      } catch (error) {
        console.error("Failed to fetch recent mappings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentMappings();
  }, []);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-success-100 rounded-lg">
            <Clock className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Mappings</h3>
            <p className="text-sm text-slate-500">Latest NAMASTE-ICD11 mappings</p>
          </div>
        </div>
        <button className="btn-secondary text-sm" onClick={() => setActivePage('database-list')}>
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {recentMappings.map((mapping) => (
            <div key={mapping.id} className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium">
                    {mapping.namasteCode}
                  </span>
                  <span className="font-medium text-slate-900">{mapping.englishName}</span>
                </div>
                <span className={`confidence-${mapping.confidenceLevel.toLowerCase()}`}>
                  {mapping.confidenceLevel}
                </span>
              </div>
              <div className="text-sm text-slate-600 mb-2">
                <span className="font-medium">{mapping.namasteName}</span> → {mapping.ICD_11_code}
              </div>
              <p className="text-xs text-slate-500">Updated {mapping.lastUpdated}</p>
            </div>
          ))}

          {recentMappings.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-4">
              No recent mappings found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}