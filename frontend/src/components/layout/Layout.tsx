import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLiveFeed } from '../../hooks/useLiveFeed';

export default function Layout() {
  const location = useLocation();
  const [title, setTitle] = useState('Cognitive Twin Inspector');

  // Initialize global socket connection for live updates
  useLiveFeed();

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    const titles: Record<string, string> = {
      'dashboard': 'Cognitive Twin Inspector',
      'arena': 'Adversarial Battle Arena',
      'hud': 'Tactical HUD Interface',
      'simulate': 'Live Simulation & Drift',
      'decisions': 'Immutable Decision Audit Log',
      'systems': 'Model Nodes & Benchmarks',
      'analytics': 'Cross-Dataset Replication Suite',
      'profile': 'Auditor Profile & Credentials',
      'admin': 'Admin Console & Safeguards',
      'how-it-works': 'System Architecture & Documentation'
    };
    
    setTitle(titles[path] || 'Cognitive Digital Twin');
  }, [location.pathname]);

  return (
    <div className="bg-[#070d1f] min-h-screen text-slate-200 w-full overflow-x-hidden flex flex-col font-sans">
      <Sidebar />
      <div className="md:pl-64 flex flex-col min-h-screen w-full">
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 relative w-full max-w-[1600px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
