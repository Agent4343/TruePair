import { create } from 'zustand';
import { api } from '@/lib/api';

interface Photo {
  id: string;
  url: string;
  isMain: boolean;
}

interface Prompt {
  id: string;
  question: string;
  answer: string;
}

interface Profile {
  id: string;
  userId: string;
  firstName: string;
  birthDate: string;
  gender: string;
  genderPreferences: string[];
  bio?: string;
  city?: string;
  state?: string;
  relationshipIntent?: string;
  height?: number;
  education?: string;
  occupation?: string;
  company?: string;
  photos: Photo[];
  prompts: Prompt[];
  profileStrength?: number;
  verificationLevel?: string;
}

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  createProfile: (data: Partial<Profile>) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
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
      const profile = await api.profile.get();
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.profile.create(data);
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await api.profile.update(data);
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  addPhoto: async (url, isMain = false) => {
    try {
      const photo = await api.profile.addPhoto(url, isMain);
      const current = get().profile;
      if (current) {
        set({
          profile: {
            ...current,
            photos: [...current.photos, photo],
          },
        });
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  addPrompt: async (question, answer) => {
    try {
      const prompt = await api.profile.addPrompt(question, answer);
      const current = get().profile;
      if (current) {
        set({
          profile: {
            ...current,
            prompts: [...current.prompts, prompt],
          },
        });
      }
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },
}));
