'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { 
  Heart, Settings, Shield, ChevronRight, MapPin, Target, 
  Camera, Edit3, LogOut 
} from 'lucide-react';
import { getAge, RELATIONSHIP_INTENTS } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { checkAuth, logout, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { profile, fetchProfile, isLoading: profileLoading } = useProfileStore();
  const [trustScore, setTrustScore] = useState<any>(null);

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
      fetchProfile();
      loadTrustScore();
    }
  }, [isAuthenticated, fetchProfile]);

  const loadTrustScore = async () => {
    try {
      const score = await api.trust.getTrustScore();
      setTrustScore(score);
    } catch (error) {
      console.error('Failed to load trust score:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading || !isAuthenticated || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-16 h-16 text-primary-500" />
        </div>
      </div>
    );
  }

  const mainPhoto = profile?.photos?.find((p: any) => p.isMain)?.url || 
    profile?.photos?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-secondary-500 pt-12 pb-24 px-6">
        <div className="flex justify-between items-start max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <button
            onClick={() => router.push('/settings')}
            className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="max-w-md mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Photo & Basic Info */}
          <div className="relative">
            <div className="aspect-square bg-gray-100">
              {mainPhoto ? (
                <img
                  src={mainPhoto}
                  alt={profile?.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera className="w-16 h-16 text-gray-300" />
                </div>
              )}
            </div>
            <button
              onClick={() => router.push('/profile/edit')}
              className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              <Edit3 className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {profile?.firstName || 'Add your name'}
                {profile?.birthDate && `, ${getAge(profile.birthDate)}`}
              </h2>
              {profile?.verificationLevel && (
                <Shield className="w-6 h-6 text-blue-500" />
              )}
            </div>

            {(profile?.city || profile?.state) && (
              <div className="flex items-center gap-1 text-gray-500 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{profile?.city}{profile?.state && `, ${profile.state}`}</span>
              </div>
            )}

            {profile?.bio && (
              <p className="text-gray-600 mb-4">{profile.bio}</p>
            )}

            {profile?.relationshipIntent && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                <Target className="w-4 h-4" />
                {RELATIONSHIP_INTENTS[profile.relationshipIntent]}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-primary-600">
              {trustScore?.score || 0}
            </div>
            <div className="text-xs text-gray-500">Trust Score</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-secondary-600">
              {profile?.photos?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Photos</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-pink-600">
              {profile?.prompts?.length || 0}
            </div>
            <div className="text-xs text-gray-500">Prompts</div>
          </div>
        </div>

        {/* Profile Completeness */}
        <div className="bg-white rounded-2xl p-4 mt-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-700">Profile Strength</span>
            <span className="text-sm text-primary-600 font-medium">
              {profile?.profileStrength || 0}%
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
              style={{ width: `${profile?.profileStrength || 0}%` }}
            />
          </div>
          {(profile?.profileStrength || 0) < 100 && (
            <p className="text-sm text-gray-500 mt-2">
              Complete your profile to get more matches!
            </p>
          )}
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl mt-6 shadow-sm overflow-hidden">
          <button
            onClick={() => router.push('/profile/edit')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Edit3 className="w-5 h-5 text-primary-600" />
              </div>
              <span className="font-medium text-gray-700">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => router.push('/profile/photos')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-secondary-600" />
              </div>
              <span className="font-medium text-gray-700">Manage Photos</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={() => router.push('/settings')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-700">Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 mt-6 text-red-500 font-medium hover:bg-red-50 rounded-2xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>

      <Navigation />
    </div>
  );
}
