import { create } from 'zustand';
import { api } from '@/lib/api';

interface Profile {
  id: string;
  firstName: string;
  displayName?: string;
  birthDate: string;
  gender: string;
  genderPreferences: string[];
  city?: string;
  state?: string;
  bio?: string;
  height?: number;
  relationshipIntent?: string;
  values?: { top: string[] };
  lifestyle?: Record<string, number>;
  photos: Array<{ id: string; url: string; isMain: boolean }>;
  prompts: Array<{ id: string; question: string; answer: string }>;
  profileStrengthScore: number;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  createProfile: (data: any) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  addPhoto: (url: string, isMain?: boolean) => Promise<void>;
  addPrompt: (question: string, answer: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.getProfile();
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.createProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.updateProfile(data);
      set({ profile, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  addPhoto: async (url, isMain = false) => {
    try {
      await api.addPhoto(url, isMain);
      await get().fetchProfile();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  addPrompt: async (question, answer) => {
    try {
      await api.addPrompt(question, answer);
      await get().fetchProfile();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
