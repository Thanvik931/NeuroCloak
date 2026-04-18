import React, { useState, useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useLiveFeed } from '../../hooks/useLiveFeed';
import AssistantBot from '../chat/AssistantBot';

export default function Layout() {
  const location = useLocation();
  const [title, setTitle] = useState('Dashboard');

  // Initialize global socket connection for live updates!
  useLiveFeed();

  useEffect(() => {
    const path = location.pathname.split('/')[1];
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard Overview',
      'simulate': 'Live Simulation & Audit',
      'decisions': 'Decision Audit Log',
      'systems': 'AI Systems Registry',
      'analytics': 'Global Analytics',
      'how-it-works': 'Documentation'
    };
    
    setTitle(titles[path] || 'NeuroCloak');
  }, [location.pathname]);

  return (
    <div className="flex bg-dark-bg h-screen text-slate-200 w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <Header title={title} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-bg p-8 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
