'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Heart, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/discover');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="w-16 h-16 text-primary-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center max-w-md">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-4">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              TrueMatch
            </h1>
            <p className="text-gray-600 mt-2">Find Your True Connection</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-10">
            <div className="flex items-center gap-3 text-left bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Trust First</h3>
                <p className="text-sm text-gray-600">Verified profiles & safety features</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Smart Matching</h3>
                <p className="text-sm text-gray-600">AI-powered compatibility scoring</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left bg-white/60 backdrop-blur rounded-xl p-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Real Connections</h3>
                <p className="text-sm text-gray-600">Meaningful matches based on values</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              href="/register"
              className="block w-full py-4 px-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="block w-full py-4 px-6 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-sm text-gray-500">
        <p>By continuing, you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}
