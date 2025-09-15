// src/store/service.store.ts
import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  authorId: number;
}

interface ServiceState {
  services: Service[];
  selectedService: Service | null; // <-- Add this to hold a single service
  loading: boolean;
  error: string | null;
}

interface ServiceActions {
  fetchServices: () => Promise<void>;
  fetchServiceById: (id: number) => Promise<void>; // <-- Add this new action
}

export const useServiceStore = create<ServiceState & ServiceActions>((set) => ({
  services: [],
  selectedService: null, // <-- Initialize it
  loading: false,
  error: null,

  fetchServices: async () => {
    // ... (this is unchanged)
  },

  // --- ADD THIS NEW ACTION ---
  fetchServiceById: async (id: number) => {
    set({ loading: true, error: null, selectedService: null });
    try {
      const response = await axios.get<Service>(`${API_URL}/services/${id}`);
      set({ selectedService: response.data, loading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ loading: false, error: errorMessage });
    }
  },
}));
