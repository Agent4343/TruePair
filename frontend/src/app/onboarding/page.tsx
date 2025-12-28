'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';
import { Heart, ArrowLeft, ArrowRight, User, MapPin, Target } from 'lucide-react';

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

export default function OnboardingPage() {
  const router = useRouter();
  const { createProfile } = useProfileStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    birthDate: '',
    gender: '',
    genderPreferences: [] as string[],
    city: '',
    state: '',
    bio: '',
    relationshipIntent: '',
  });

  const totalSteps = 5;

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

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.firstName.trim().length >= 2;
      case 2:
        return formData.birthDate && formData.gender;
      case 3:
        return formData.genderPreferences.length > 0;
      case 4:
        return formData.relationshipIntent;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      setError('');
      try {
        await createProfile(formData);
        router.push('/discover');
      } catch (err: any) {
        setError(err.message || 'Failed to create profile');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={handleBack}
          className={`w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm ${
            step === 1 ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-primary-500" />
          <span className="font-semibold text-gray-800">TrueMatch</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${
                i < step ? 'bg-primary-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Step {step} of {totalSteps}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">What's your name?</h2>
              <p className="text-gray-600 mt-2">This is how you'll appear on TrueMatch</p>
            </div>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => updateForm('firstName', e.target.value)}
              className="w-full px-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-center text-xl"
              placeholder="Your first name"
              autoFocus
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">About you</h2>
              <p className="text-gray-600 mt-2">Help us find your best matches</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateForm('birthDate', e.target.value)}
                className="w-full px-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
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
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">I'm interested in</h2>
              <p className="text-gray-600 mt-2">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GENDERS.map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => toggleGenderPreference(gender)}
                  className={`py-4 px-4 rounded-xl border-2 transition-all ${
                    formData.genderPreferences.includes(gender)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {GENDER_LABELS[gender]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">What are you looking for?</h2>
              <p className="text-gray-600 mt-2">Be honest - it helps find better matches</p>
            </div>
            <div className="space-y-3">
              {INTENTS.map((intent) => (
                <button
                  key={intent}
                  type="button"
                  onClick={() => updateForm('relationshipIntent', intent)}
                  className={`w-full py-4 px-4 rounded-xl border-2 text-left transition-all ${
                    formData.relationshipIntent === intent
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {INTENT_LABELS[intent]}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-pink-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Where are you located?</h2>
              <p className="text-gray-600 mt-2">We'll show you people nearby</p>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={formData.city}
                onChange={(e) => updateForm('city', e.target.value)}
                className="w-full px-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="City"
              />
              <input
                type="text"
                value={formData.state}
                onChange={(e) => updateForm('state', e.target.value)}
                className="w-full px-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                placeholder="State/Region"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio (optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => updateForm('bio', e.target.value)}
                className="w-full px-4 py-4 bg-white rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                rows={3}
                placeholder="Tell others about yourself..."
                maxLength={500}
              />
            </div>
          </div>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={!canProceed() || isLoading}
        className="w-full py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          'Creating profile...'
        ) : step === totalSteps ? (
          'Complete Profile'
        ) : (
          <>
            Continue <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}
