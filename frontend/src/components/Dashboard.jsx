import React, { useState, useEffect } from 'react';
import MetricsCards from './MetricsCards';
import AnalyticsCharts from './AnalyticsChart'; // <--- Newly added chart component
import QuickSearch from './QuickSearch';
import RecentMappings from './RecentMappings';

export default function Dashboard({ setActivePage }) {
  const [stats, setStats] = useState({
    totalMappings: 0,
    mappedToIcd: 0,
    highConfidence: 0,
    pendingReview: 0
  });

  // NEW: State to hold the weekly progress data for the Bar Chart
  const [weeklyData, setWeeklyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch main stats
        const response = await fetch('https://ayurconnect-portal.onrender.com/api/diseases/stats');
        const data = await response.json();
        setStats(data);

        // 2. Mock weekly data (Replace this with a real fetch later: fetch('/api/diseases/weekly-progress'))
        // Generating random data so the chart looks alive until you connect the backend
        setWeeklyData([
          { day: 'Mon', mapped: Math.floor(Math.random() * 50) + 10 },
          { day: 'Tue', mapped: Math.floor(Math.random() * 50) + 30 },
          { day: 'Wed', mapped: Math.floor(Math.random() * 50) + 20 },
          { day: 'Thu', mapped: Math.floor(Math.random() * 50) + 60 },
          { day: 'Fri', mapped: Math.floor(Math.random() * 50) + 80 },
          { day: 'Sat', mapped: Math.floor(Math.random() * 50) + 15 },
          { day: 'Sun', mapped: Math.floor(Math.random() * 50) + 5 },
        ]);

      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    // Added a subtle slate-50 background to make the white cards pop beautifully
    <div className="space-y-8 bg-slate-50 min-h-[calc(100vh-80px)] rounded-3xl p-2 md:p-4 animate-in fade-in duration-500">

      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor and manage NAMASTE-ICD11 terminology mappings</p>
        </div>
        <div className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Last updated: {new Date().toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })}
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      {/* <MetricsCards stats={stats} isLoading={isLoading} /> */}

      {/* 3. Analytics Charts (Replaces the old CSS circle) */}
      <AnalyticsCharts stats={stats} weeklyData={weeklyData} isLoading={isLoading} />

      {/* 4. Bottom Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column (Takes up 2/3 of space): Recent Mappings */}
        <div className="xl:col-span-2 bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <RecentMappings setActivePage={setActivePage} />
        </div>

        {/* Right Column (Takes up 1/3 of space): Quick Search */}
        {/* Placed in a card to match the height and design of the Mappings table */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Search</h3>
          <div className="flex-1">
            <QuickSearch setActivePage={setActivePage} />
          </div>
        </div>

      </div>
    </div>
  );
}