const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth methods
  auth = {
    register: async (email: string, password: string) => {
      const data = await this.request<{ accessToken: string; user: any }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(data.accessToken);
      return data;
    },

    login: async (email: string, password: string) => {
      const data = await this.request<{ accessToken: string; user: any }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      this.setToken(data.accessToken);
      return data;
    },

    getMe: () => this.request<any>('/api/auth/me'),

    logout: () => {
      this.setToken(null);
    },
  };

  // Profile methods
  profile = {
    create: (data: any) =>
      this.request<any>('/api/profiles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    get: () => this.request<any>('/api/profiles'),

    update: (data: any) =>
      this.request<any>('/api/profiles', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    getScore: () => this.request<any>('/api/profiles/score'),

    addPhoto: (url: string, isMain = false) =>
      this.request<any>('/api/profiles/photos', {
        method: 'POST',
        body: JSON.stringify({ url, isMain }),
      }),

    deletePhoto: (photoId: string) =>
      this.request<any>(`/api/profiles/photos/${photoId}`, {
        method: 'DELETE',
      }),

    addPrompt: (question: string, answer: string) =>
      this.request<any>('/api/profiles/prompts', {
        method: 'POST',
        body: JSON.stringify({ question, answer }),
      }),
  };

  // Onboarding methods
  onboarding = {
    getQuestions: (category?: string) => {
      const query = category ? `?category=${category}` : '';
      return this.request<any[]>(`/api/onboarding/questions${query}`);
    },

    getProgress: () => this.request<any>('/api/onboarding/progress'),

    submitAnswer: (questionId: string, answer: any) =>
      this.request<any>('/api/onboarding/answer', {
        method: 'POST',
        body: JSON.stringify({ questionId, answer }),
      }),

    complete: () =>
      this.request<any>('/api/onboarding/complete', {
        method: 'POST',
      }),
  };

  // Matching methods
  matching = {
    getDiscover: (limit = 10) =>
      this.request<any[]>(`/api/matching/discover?limit=${limit}`),

    like: (userId: string) =>
      this.request<any>(`/api/matching/like/${userId}`, {
        method: 'POST',
      }),

    pass: (userId: string) =>
      this.request<any>(`/api/matching/pass/${userId}`, {
        method: 'POST',
      }),

    getMatches: () => this.request<any[]>('/api/matching/matches'),

    getMatch: (matchId: string) =>
      this.request<any>(`/api/matching/matches/${matchId}`),
  };

  // Messages methods
  messages = {
    getMessages: (matchId: string, limit = 50) =>
      this.request<any[]>(`/api/messages/match/${matchId}?limit=${limit}`),

    sendMessage: (matchId: string, content: string) =>
      this.request<any>(`/api/messages/match/${matchId}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),

    markAsRead: (matchId: string) =>
      this.request<any>(`/api/messages/match/${matchId}/read`, {
        method: 'POST',
      }),

    getUnreadCount: () =>
      this.request<{ unreadCount: number }>('/api/messages/unread'),
  };

  // Safety methods
  safety = {
    reportUser: (userId: string, type: string, description?: string) =>
      this.request<any>('/api/safety/report', {
        method: 'POST',
        body: JSON.stringify({ userId, type, description }),
      }),

    blockUser: (userId: string, reason?: string) =>
      this.request<any>('/api/safety/block', {
        method: 'POST',
        body: JSON.stringify({ userId, reason }),
      }),

    getSignals: (userId: string) =>
      this.request<any[]>(`/api/safety/signals/${userId}`),

    getPreDateCheck: (matchId: string) =>
      this.request<any>(`/api/safety/pre-date/${matchId}`),
  };

  // Trust methods
  trust = {
    getTrustScore: () => this.request<any>('/api/trust/score'),
  };
}

export const api = new ApiClient();
