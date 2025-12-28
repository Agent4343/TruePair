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

  // Auth
  async register(email: string, password: string) {
    const data = await this.request<{ accessToken: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ accessToken: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.accessToken);
    return data;
  }

  async getMe() {
    return this.request<any>('/api/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Profile
  async createProfile(data: any) {
    return this.request<any>('/api/profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request<any>('/api/profiles');
  }

  async updateProfile(data: any) {
    return this.request<any>('/api/profiles', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getProfileScore() {
    return this.request<any>('/api/profiles/score');
  }

  async addPhoto(url: string, isMain = false) {
    return this.request<any>('/api/profiles/photos', {
      method: 'POST',
      body: JSON.stringify({ url, isMain }),
    });
  }

  async addPrompt(question: string, answer: string) {
    return this.request<any>('/api/profiles/prompts', {
      method: 'POST',
      body: JSON.stringify({ question, answer }),
    });
  }

  // Onboarding
  async getOnboardingQuestions(category?: string) {
    const query = category ? `?category=${category}` : '';
    return this.request<any[]>(`/api/onboarding/questions${query}`);
  }

  async getOnboardingProgress() {
    return this.request<any>('/api/onboarding/progress');
  }

  async submitAnswer(questionId: string, answer: any) {
    return this.request<any>('/api/onboarding/answer', {
      method: 'POST',
      body: JSON.stringify({ questionId, answer }),
    });
  }

  async completeOnboarding() {
    return this.request<any>('/api/onboarding/complete', {
      method: 'POST',
    });
  }

  // Matching
  async getDiscoverProfiles(limit = 10) {
    return this.request<any[]>(`/api/matching/discover?limit=${limit}`);
  }

  async likeUser(userId: string) {
    return this.request<any>(`/api/matching/like/${userId}`, {
      method: 'POST',
    });
  }

  async passUser(userId: string) {
    return this.request<any>(`/api/matching/pass/${userId}`, {
      method: 'POST',
    });
  }

  async getMatches() {
    return this.request<any[]>('/api/matching/matches');
  }

  async getMatch(matchId: string) {
    return this.request<any>(`/api/matching/matches/${matchId}`);
  }

  // Messages
  async getMessages(matchId: string, limit = 50) {
    return this.request<any[]>(`/api/messages/match/${matchId}?limit=${limit}`);
  }

  async sendMessage(matchId: string, content: string) {
    return this.request<any>(`/api/messages/match/${matchId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async markAsRead(matchId: string) {
    return this.request<any>(`/api/messages/match/${matchId}/read`, {
      method: 'POST',
    });
  }

  async getUnreadCount() {
    return this.request<{ unreadCount: number }>('/api/messages/unread');
  }

  // Safety
  async reportUser(userId: string, type: string, description?: string) {
    return this.request<any>('/api/safety/report', {
      method: 'POST',
      body: JSON.stringify({ userId, type, description }),
    });
  }

  async blockUser(userId: string, reason?: string) {
    return this.request<any>('/api/safety/block', {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    });
  }

  async getSafetySignals(userId: string) {
    return this.request<any[]>(`/api/safety/signals/${userId}`);
  }

  // Trust
  async getTrustScore() {
    return this.request<any>('/api/trust/score');
  }
}

export const api = new ApiClient();
