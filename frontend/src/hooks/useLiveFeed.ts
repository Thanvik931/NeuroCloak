import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const useLiveFeed = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore(state => state.token);

  useEffect(() => {
    if (!token) return;

    const API_BASE = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : window.location.origin;

    // Connect to Backend WebSocket server using JWT for Auth
    const socket = io(API_BASE, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to NeuroCloak LiveFeed WebSocket');
    });

    socket.on('new_decision', (decision) => {
      
      // Update the Recent Decisions table automatically
      queryClient.setQueryData(['recent-decisions'], (oldData: any) => {
        if (!oldData) return oldData;
        
        // Ensure the nested structure matches our Prisma joins
        const formattedDecision = {
           ...decision,
           aiSystem: decision.aiSystem || { name: 'Unknown System', domain: 'unknown' } 
        };

        const newDecisions = [formattedDecision, ...oldData.data].slice(0, 10);
        return { ...oldData, data: newDecisions };
      });

      // Update Analytics Summary metrics globally
      queryClient.setQueryData(['analytics-summary'], (oldData: any) => {
        if (!oldData) return oldData;
        return { 
          ...oldData, 
          totalDecisions: oldData.totalDecisions + 1,
          activeFlags: decision.status === 'FLAGGED' ? oldData.activeFlags + 1 : oldData.activeFlags
        };
      });
      
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);
};
