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
    if (path) {
      if (path === 'decisions') setTitle('Decision Audit Log');
      else if (path === 'simulate') setTitle('Live Simulation');
      else setTitle(path.charAt(0).toUpperCase() + path.slice(1));
    }
  }, [location]);

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
