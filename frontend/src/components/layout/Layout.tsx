import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLiveFeed } from '../../hooks/useLiveFeed';

export default function Layout() {
  const location = useLocation();
  const [title, setTitle] = useState('Dashboard');

  // Initialize global socket connection for live updates
  useLiveFeed();

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard Overview',
      'simulate': 'Live Simulation & Audit',
      'decisions': 'Decision Audit Log',
      'systems': 'AI Systems Registry',
      'analytics': 'Global Analytics',
      'profile': 'My Profile & Settings',
      'how-it-works': 'Documentation'
    };
    
    setTitle(titles[path] || 'NeuroCloak');
  }, [location.pathname]);

  return (
    <div className="bg-dark-bg min-h-screen text-slate-200 w-full overflow-x-hidden flex flex-col font-sans">
      <Sidebar />
      <Header title={title} />
      <main className="flex-1 overflow-x-hidden p-6 md:p-8 relative w-full">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
