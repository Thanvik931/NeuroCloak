import { create } from 'zustand';

export type SocketStatus = 'connected' | 'reconnecting' | 'disconnected';

interface SocketState {
  status: SocketStatus;
  lastPing: number | null;
  setStatus: (status: SocketStatus) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  status: 'disconnected',
  lastPing: null,
  setStatus: (status) => set({ status, lastPing: Date.now() }),
}));
