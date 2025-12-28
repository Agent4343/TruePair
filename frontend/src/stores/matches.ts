import { create } from 'zustand';
import { api } from '@/lib/api';

interface Photo {
  url: string;
  isMain: boolean;
}

interface DiscoverProfile {
  id: string;
  firstName: string;
  birthDate: string;
  bio?: string;
  city?: string;
  state?: string;
  relationshipIntent?: string;
  photos: Photo[];
  verificationLevel?: string;
  compatibility?: number;
}

interface Match {
  id: string;
  matchedAt: string;
  profile: {
    id: string;
    firstName: string;
    birthDate: string;
    city?: string;
    photos: Photo[];
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  };
  unreadCount: number;
}

interface MatchesState {
  matches: Match[];
  discoverProfiles: DiscoverProfile[];
  currentProfileIndex: number;
  isLoading: boolean;
  error: string | null;
  fetchMatches: () => Promise<void>;
  fetchDiscoverProfiles: () => Promise<void>;
  likeProfile: (profileId: string) => Promise<{ isMatch: boolean } | null>;
  passProfile: (profileId: string) => Promise<void>;
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
      const matches = await api.matching.getMatches();
      set({ matches, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDiscoverProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const profiles = await api.matching.getDiscover(20);
      set({ discoverProfiles: profiles, currentProfileIndex: 0, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  likeProfile: async (profileId) => {
    try {
      const result = await api.matching.like(profileId);
      if (result.isMatch) {
        // Refresh matches if there's a new match
        get().fetchMatches();
      }
      return result;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  passProfile: async (profileId) => {
    try {
      await api.matching.pass(profileId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  nextProfile: () => {
    const { currentProfileIndex, discoverProfiles } = get();
    if (currentProfileIndex < discoverProfiles.length - 1) {
      set({ currentProfileIndex: currentProfileIndex + 1 });
    } else {
      set({ discoverProfiles: [], currentProfileIndex: 0 });
    }
  },
}));
