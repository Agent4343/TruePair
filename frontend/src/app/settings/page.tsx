'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { 
  ArrowLeft, Bell, Shield, Eye, Lock, Trash2, 
  ChevronRight, Moon, Globe, HelpCircle, FileText 
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { checkAuth, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleDeleteAccount = async () => {
    // In a real app, you would call the API to delete the account
    logout();
    router.push('/');
  };

  if (authLoading || !isAuthenticated) {
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
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Settings</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Account Settings */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Account
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <SettingItem
              icon={<Lock className="w-5 h-5" />}
              label="Change Password"
              onClick={() => router.push('/settings/password')}
            />
            <SettingItem
              icon={<Shield className="w-5 h-5" />}
              label="Privacy"
              onClick={() => router.push('/settings/privacy')}
            />
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              label="Notifications"
              onClick={() => router.push('/settings/notifications')}
            />
          </div>
        </section>

        {/* Discovery Settings */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Discovery
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <SettingItem
              icon={<Eye className="w-5 h-5" />}
              label="Discovery Preferences"
              onClick={() => router.push('/settings/discovery')}
            />
            <SettingItem
              icon={<Globe className="w-5 h-5" />}
              label="Location"
              onClick={() => router.push('/settings/location')}
            />
          </div>
        </section>

        {/* App Settings */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            App
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <SettingItem
              icon={<Moon className="w-5 h-5" />}
              label="Appearance"
              value="Light"
              onClick={() => {}}
            />
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Support
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <SettingItem
              icon={<HelpCircle className="w-5 h-5" />}
              label="Help Center"
              onClick={() => {}}
            />
            <SettingItem
              icon={<FileText className="w-5 h-5" />}
              label="Terms of Service"
              onClick={() => {}}
            />
            <SettingItem
              icon={<FileText className="w-5 h-5" />}
              label="Privacy Policy"
              onClick={() => {}}
            />
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3 px-1">
            Danger Zone
          </h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-4 p-4 hover:bg-red-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <Trash2 className="w-5 h-5" />
              </div>
              <span className="font-medium text-red-500">Delete Account</span>
            </button>
          </div>
        </section>

        {/* App Version */}
        <div className="text-center text-sm text-gray-400 py-4">
          <p>TrueMatch v1.0.0</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
              Delete Account?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingItem({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-t border-gray-100 first:border-t-0"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-gray-400">{value}</span>}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );
}
