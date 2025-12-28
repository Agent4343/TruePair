import { create } from 'zustand';
import { api } from '@/lib/api';

interface Match {
  id: string;
  otherUser: {
    id: string;
    profile: {
      firstName: string;
      displayName?: string;
      photos: Array<{ url: string; isMain: boolean }>;
    };
  };
  overallScore: number;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  createdAt: string;
}

interface DiscoverProfile {
  id: string;
  userId: string;
  firstName: string;
  displayName?: string;
  birthDate: string;
  gender: string;
  city?: string;
  bio?: string;
  relationshipIntent?: string;
  photos: Array<{ url: string; isMain: boolean }>;
  prompts: Array<{ question: string; answer: string }>;
  compatibility: {
    overall: number;
    reasons: string[];
  };
}

interface MatchesState {
  matches: Match[];
  discoverProfiles: DiscoverProfile[];
  currentProfileIndex: number;
  isLoading: boolean;
  error: string | null;
  fetchMatches: () => Promise<void>;
  fetchDiscoverProfiles: () => Promise<void>;
  likeProfile: (userId: string) => Promise<{ matched: boolean; match?: any }>;
  passProfile: (userId: string) => Promise<void>;
  nextProfile: () => void;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  discoverProfiles: [],
  currentProfileIndex: 0,
  isLoading: false,
  error: null,

  fetchMatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const matches = await api.getMatches();
      set({ matches, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchDiscoverProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await api.getDiscoverProfiles(20);
      set({ discoverProfiles: profiles, currentProfileIndex: 0, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  likeProfile: async (userId: string) => {
    try {
      const result = await api.likeUser(userId);
      if (result.matched) {
        await get().fetchMatches();
      }
      return result;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  passProfile: async (userId: string) => {
    try {
      await api.passUser(userId);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  nextProfile: () => {
    const { currentProfileIndex, discoverProfiles } = get();
    if (currentProfileIndex < discoverProfiles.length - 1) {
      set({ currentProfileIndex: currentProfileIndex + 1 });
    } else {
      get().fetchDiscoverProfiles();
    }
  },
}));
