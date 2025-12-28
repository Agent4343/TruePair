'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useProfileStore } from '@/stores/profile';
import { ArrowLeft, Save } from 'lucide-react';

const GENDERS = ['MALE', 'FEMALE', 'NON_BINARY', 'OTHER'];
const GENDER_LABELS: Record<string, string> = {
  MALE: 'Man',
  FEMALE: 'Woman',
  NON_BINARY: 'Non-binary',
  OTHER: 'Other',
};

const INTENTS = ['CASUAL', 'SHORT_TERM', 'LONG_TERM', 'MARRIAGE', 'FIGURING_OUT'];
const INTENT_LABELS: Record<string, string> = {
  CASUAL: 'Casual Dating',
  SHORT_TERM: 'Short-term Relationship',
  LONG_TERM: 'Long-term Relationship',
  MARRIAGE: 'Marriage',
  FIGURING_OUT: 'Still Figuring It Out',
};

export default function EditProfilePage() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { profile, fetchProfile, updateProfile, isLoading } = useProfileStore();
  
  const [formData, setFormData] = useState({
    firstName: '',
    bio: '',
    city: '',
    state: '',
    gender: '',
    genderPreferences: [] as string[],
    relationshipIntent: '',
    height: '',
    education: '',
    occupation: '',
    company: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

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
    }
  }, [isAuthenticated, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        bio: profile.bio || '',
        city: profile.city || '',
        state: profile.state || '',
        gender: profile.gender || '',
        genderPreferences: profile.genderPreferences || [],
        relationshipIntent: profile.relationshipIntent || '',
        height: profile.height?.toString() || '',
        education: profile.education || '',
        occupation: profile.occupation || '',
        company: profile.company || '',
      });
    }
  }, [profile]);

  const updateForm = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleGenderPreference = (gender: string) => {
    setFormData((prev) => ({
      ...prev,
      genderPreferences: prev.genderPreferences.includes(gender)
        ? prev.genderPreferences.filter((g) => g !== gender)
        : [...prev.genderPreferences, gender],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      await updateProfile({
        ...formData,
        height: formData.height ? parseInt(formData.height) : undefined,
      });
      router.push('/profile');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || !isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Edit Profile</h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500 text-white disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Basic Info</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => updateForm('firstName', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="Your first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateForm('bio', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                rows={4}
                placeholder="Tell others about yourself..."
                maxLength={500}
              />
              <p className="text-sm text-gray-400 text-right mt-1">
                {formData.bio.length}/500
              </p>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Location</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateForm('city', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateForm('state', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="State"
              />
            </div>
          </div>
        </section>

        {/* Gender */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">I am a</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENDERS.map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => updateForm('gender', gender)}
                className={`py-3 px-4 rounded-xl border-2 transition-all ${
                  formData.gender === gender
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {GENDER_LABELS[gender]}
              </button>
            ))}
          </div>
        </section>

        {/* Interested In */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Interested In</h2>
          <div className="grid grid-cols-2 gap-3">
            {GENDERS.map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => toggleGenderPreference(gender)}
                className={`py-3 px-4 rounded-xl border-2 transition-all ${
                  formData.genderPreferences.includes(gender)
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {GENDER_LABELS[gender]}
              </button>
            ))}
          </div>
        </section>

        {/* Relationship Intent */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">Looking For</h2>
          <div className="space-y-2">
            {INTENTS.map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => updateForm('relationshipIntent', intent)}
                className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all ${
                  formData.relationshipIntent === intent
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {INTENT_LABELS[intent]}
              </button>
            ))}
          </div>
        </section>

        {/* More About Me */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4">More About Me</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => updateForm('height', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="e.g., 175"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => updateForm('education', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="e.g., Bachelor's degree"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occupation
              </label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => updateForm('occupation', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => updateForm('company', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="e.g., Google"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
