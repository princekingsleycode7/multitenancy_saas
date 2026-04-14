import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SessionState {
  selectedOutletId: string | null;
  setSelectedOutletId: (id: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      selectedOutletId: null,
      setSelectedOutletId: (id) => set({ selectedOutletId: id }),
      clearSession: () => set({ selectedOutletId: null }),
    }),
    {
      name: 'session-storage',
    }
  )
);
