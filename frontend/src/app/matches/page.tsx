'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Heart, Search } from 'lucide-react';
import { formatRelativeTime, getAge, getMainPhoto } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import { api } from '@/lib/api';

interface Match {
  id: string;
  matchedAt: string;
  profile: {
    id: string;
    firstName: string;
    birthDate: string;
    city?: string;
    photos: { url: string; isMain: boolean }[];
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  };
  unreadCount: number;
}

export default function MatchesPage() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadMatches();
    }
  }, [isAuthenticated]);

  const loadMatches = async () => {
    setIsLoading(true);
    try {
      const data = await api.matching.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMatches = matches.filter((match) =>
    match.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const newMatches = filteredMatches.filter((m) => !m.lastMessage);
  const conversations = filteredMatches.filter((m) => m.lastMessage);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-16 h-16 text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
            Matches
          </h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matches"
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin">
              <Heart className="w-12 h-12 text-primary-500" />
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matches Yet</h3>
            <p className="text-gray-600 mb-6">Start swiping to find your match!</p>
            <button
              onClick={() => router.push('/discover')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Start Discovering
            </button>
          </div>
        ) : (
          <>
            {/* New Matches */}
            {newMatches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  New Matches
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
                  {newMatches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => router.push(`/chat/${match.id}`)}
                      className="flex-shrink-0 text-center"
                    >
                      <div className="relative w-20 h-20 mb-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
                        <img
                          src={getMainPhoto(match.profile.photos) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.profile.firstName}`}
                          alt={match.profile.firstName}
                          className="absolute inset-1 w-[72px] h-[72px] object-cover rounded-full border-2 border-white"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 block truncate w-20">
                        {match.profile.firstName}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Conversations */}
            {conversations.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Messages
                </h2>
                <div className="space-y-2">
                  {conversations.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => router.push(`/chat/${match.id}`)}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={getMainPhoto(match.profile.photos) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.profile.firstName}`}
                          alt={match.profile.firstName}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                        {match.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {match.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-800">
                            {match.profile.firstName}, {getAge(match.profile.birthDate)}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {formatRelativeTime(match.lastMessage!.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${match.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-500'}`}>
                          {match.lastMessage!.isFromMe && 'You: '}
                          {match.lastMessage!.content}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredMatches.length === 0 && searchQuery && (
              <div className="text-center py-10">
                <p className="text-gray-500">No matches found for "{searchQuery}"</p>
              </div>
            )}
          </>
        )}
      </div>

      <Navigation />
    </div>
  );
}
