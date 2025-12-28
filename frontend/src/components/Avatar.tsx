'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  verified?: boolean;
}

export default function Avatar({ src, name, size = 'md', className, verified }: AvatarProps) {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const fallbackUrl = name
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    : 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

  return (
    <div className={cn('relative', className)}>
      <img
        src={src || fallbackUrl}
        alt={name || 'Avatar'}
        className={cn(
          sizes[size],
          'object-cover rounded-full border-2 border-white shadow-sm'
        )}
      />
      {verified && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
