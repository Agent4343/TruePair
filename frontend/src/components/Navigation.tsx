'use client';

import { usePathname, useRouter } from 'next/navigation';
import { MessageCircle, User, Sparkles } from 'lucide-react';

const navItems = [
  { path: '/discover', icon: Sparkles, label: 'Discover' },
  { path: '/matches', icon: MessageCircle, label: 'Matches' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center py-2 px-6 rounded-xl transition-all ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
                fill={isActive ? 'currentColor' : 'none'}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
