'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';
import { ArrowLeft, Send, Shield, MoreVertical, AlertTriangle } from 'lucide-react';
import { formatTime, getAge, getMainPhoto } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  status: string;
}

interface MatchDetails {
  id: string;
  profile: {
    id: string;
    firstName: string;
    birthDate: string;
    city?: string;
    photos: { url: string; isMain: boolean }[];
    verificationLevel?: string;
  };
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  const { user, checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
  
  const [match, setMatch] = useState<MatchDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && matchId) {
      loadChatData();
    }
  }, [isAuthenticated, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    setIsLoading(true);
    try {
      const [matchData, messagesData] = await Promise.all([
        api.matching.getMatch(matchId),
        api.messages.getMessages(matchId),
      ]);
      setMatch(matchData);
      setMessages(messagesData);
    } catch (error) {
      console.error('Failed to load chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    // Optimistic update
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: user?.id || '',
      createdAt: new Date().toISOString(),
      status: 'SENDING',
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const sentMessage = await api.messages.sendMessage(matchId, content);
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? sentMessage : m));
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(content);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleReport = () => {
    setShowOptions(false);
    router.push(`/report/${match?.profile.id}`);
  };

  const handleBlock = async () => {
    if (!match) return;
    try {
      await api.safety.blockUser(match.profile.id);
      router.push('/matches');
    } catch (error) {
      console.error('Failed to block user:', error);
    }
  };

  if (authLoading || !isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Chat Not Found</h2>
        <p className="text-gray-600 mb-6">This conversation may have been removed.</p>
        <button
          onClick={() => router.push('/matches')}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium"
        >
          Back to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/matches')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={() => router.push(`/profile/${match.profile.id}`)}
            className="flex items-center gap-3 flex-1"
          >
            <div className="relative">
              <img
                src={getMainPhoto(match.profile.photos) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.profile.firstName}`}
                alt={match.profile.firstName}
                className="w-12 h-12 object-cover rounded-full"
              />
              {match.profile.verificationLevel && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="text-left">
              <h2 className="font-semibold text-gray-800">
                {match.profile.firstName}, {getAge(match.profile.birthDate)}
              </h2>
              {match.profile.city && (
                <p className="text-sm text-gray-500">{match.profile.city}</p>
              )}
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              <MoreVertical className="w-6 h-6 text-gray-600" />
            </button>
            
            {showOptions && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowOptions(false)} 
                />
                <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  <button
                    onClick={handleReport}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Report User
                  </button>
                  <button
                    onClick={handleBlock}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Shield className="w-5 h-5" />
                    Block User
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Match intro */}
        <div className="text-center py-6">
          <img
            src={getMainPhoto(match.profile.photos) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.profile.firstName}`}
            alt={match.profile.firstName}
            className="w-24 h-24 object-cover rounded-full mx-auto mb-3"
          />
          <h3 className="text-lg font-semibold text-gray-800">
            You matched with {match.profile.firstName}!
          </h3>
          <p className="text-sm text-gray-500">Say hi and start a conversation</p>
        </div>

        {messages.map((message) => {
          const isMe = message.senderId === user?.id;
          return (
            <div
              key={message.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  isMe
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm'
                }`}
              >
                <p className="break-words">{message.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-4 py-3 safe-bottom">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-primary-200 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
