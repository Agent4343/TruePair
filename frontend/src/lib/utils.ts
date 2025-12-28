import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getMainPhoto(photos: Array<{ url: string; isMain: boolean }>): string {
  const main = photos.find((p) => p.isMain);
  return main?.url || photos[0]?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
}

export const RELATIONSHIP_INTENTS: Record<string, string> = {
  CASUAL: 'Casual Dating',
  SHORT_TERM: 'Short-term',
  LONG_TERM: 'Long-term',
  MARRIAGE: 'Marriage',
  FIGURING_OUT: 'Figuring it out',
};

export const GENDERS: Record<string, string> = {
  MALE: 'Man',
  FEMALE: 'Woman',
  NON_BINARY: 'Non-binary',
  OTHER: 'Other',
};
