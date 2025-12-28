'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMatchesStore } from '@/stores/matches';
import { useAuthStore } from '@/stores/auth';
import { 
  Heart, X, MapPin, Shield, ChevronLeft, ChevronRight, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { getAge, RELATIONSHIP_INTENTS } from '@/lib/utils';
import Navigation from '@/components/Navigation';

export default function DiscoverPage() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { 
    discoverProfiles, 
    currentProfileIndex, 
    isLoading, 
    fetchDiscoverProfiles, 
    likeProfile, 
    passProfile,
    nextProfile 
  } = useMatchesStore();

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);

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
      fetchDiscoverProfiles();
    }
  }, [isAuthenticated, fetchDiscoverProfiles]);

  const currentProfile = discoverProfiles[currentProfileIndex];

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (!currentProfile) return;
    
    setSwipeDirection(direction);
    
    if (direction === 'right') {
      const result = await likeProfile(currentProfile.id);
      if (result?.isMatch) {
        setMatchedProfile(currentProfile);
        setShowMatch(true);
      }
    } else {
      await passProfile(currentProfile.id);
    }
    
    setTimeout(() => {
      nextProfile();
      setSwipeDirection(null);
      setCurrentPhotoIndex(0);
    }, 300);
  }, [currentProfile, likeProfile, passProfile, nextProfile]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    }
  };

  const nextPhoto = () => {
    if (currentProfile?.photos && currentPhotoIndex < currentProfile.photos.length - 1) {
      setCurrentPhotoIndex(prev => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(prev => prev - 1);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Discover
          </h1>
          <button 
            onClick={() => fetchDiscoverProfiles()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Card Stack */}
      <div className="max-w-md mx-auto px-4 pt-4">
        {isLoading ? (
          <div className="aspect-[3/4] bg-white rounded-3xl shadow-xl flex items-center justify-center">
            <div className="animate-spin">
              <Heart className="w-12 h-12 text-primary-500" />
            </div>
          </div>
        ) : !currentProfile ? (
          <div className="aspect-[3/4] bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No More Profiles</h3>
            <p className="text-gray-600 mb-6">Check back later for new matches!</p>
            <button
              onClick={() => fetchDiscoverProfiles()}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProfile.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                x: swipeDirection === 'left' ? -500 : swipeDirection === 'right' ? 500 : 0,
                rotate: swipeDirection === 'left' ? -20 : swipeDirection === 'right' ? 20 : 0,
              }}
              exit={{ scale: 0.95, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              className="relative aspect-[3/4] bg-white rounded-3xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing"
            >
              {/* Photo */}
              <div className="absolute inset-0">
                <img
                  src={currentProfile.photos?.[currentPhotoIndex]?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentProfile.firstName}`}
                  alt={currentProfile.firstName}
                  className="w-full h-full object-cover"
                />
                {/* Photo navigation */}
                {currentProfile.photos?.length > 1 && (
                  <>
                    {/* Photo indicators */}
                    <div className="absolute top-4 left-4 right-4 flex gap-1">
                      {currentProfile.photos.map((_: any, i: number) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i === currentPhotoIndex ? 'bg-white' : 'bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    {/* Navigation buttons */}
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/20 rounded-full text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/20 rounded-full text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>

              {/* Swipe indicators */}
              <motion.div
                className="absolute top-6 left-6 px-4 py-2 border-4 border-red-500 text-red-500 font-bold text-2xl rounded-lg rotate-[-20deg]"
                style={{ opacity: 0 }}
                animate={{ opacity: swipeDirection === 'left' ? 1 : 0 }}
              >
                NOPE
              </motion.div>
              <motion.div
                className="absolute top-6 right-6 px-4 py-2 border-4 border-green-500 text-green-500 font-bold text-2xl rounded-lg rotate-[20deg]"
                style={{ opacity: 0 }}
                animate={{ opacity: swipeDirection === 'right' ? 1 : 0 }}
              >
                LIKE
              </motion.div>

              {/* Profile Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-3xl font-bold">
                    {currentProfile.firstName}, {getAge(currentProfile.birthDate)}
                  </h2>
                  {currentProfile.verificationLevel && (
                    <Shield className="w-6 h-6 text-blue-400" />
                  )}
                </div>
                {currentProfile.city && (
                  <div className="flex items-center gap-1 text-white/80 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{currentProfile.city}{currentProfile.state && `, ${currentProfile.state}`}</span>
                  </div>
                )}
                {currentProfile.relationshipIntent && (
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm">
                    {RELATIONSHIP_INTENTS[currentProfile.relationshipIntent]}
                  </span>
                )}
                {currentProfile.bio && (
                  <p className="mt-3 text-white/90 line-clamp-2">{currentProfile.bio}</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Action Buttons */}
        {currentProfile && (
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              onClick={() => handleSwipe('left')}
              className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              <X className="w-8 h-8 text-red-500" />
            </button>
            <button
              onClick={() => handleSwipe('right')}
              className="w-20 h-20 flex items-center justify-center bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
            >
              <Heart className="w-10 h-10 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {showMatch && matchedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse-slow" />
                <img
                  src={matchedProfile.photos?.[0]?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedProfile.firstName}`}
                  alt={matchedProfile.firstName}
                  className="absolute inset-2 w-28 h-28 object-cover rounded-full border-4 border-white"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">It's a Match!</h2>
              <p className="text-gray-600 mb-6">
                You and {matchedProfile.firstName} liked each other
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowMatch(false);
                    router.push('/matches');
                  }}
                  className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowMatch(false)}
                  className="w-full py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl"
                >
                  Keep Swiping
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  );
}
