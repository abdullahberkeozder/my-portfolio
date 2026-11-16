import { useSyncExternalStore } from 'react';

function subscribeBookmarks(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('bookmarks-updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('bookmarks-updated', callback);
  };
}

function getBookmarksSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  return localStorage.getItem('novablog_bookmarks') || '[]';
}

function getBookmarksServerSnapshot(): string {
  return '[]';
}

export function useBookmarks(): number[] {
  const raw = useSyncExternalStore(subscribeBookmarks, getBookmarksSnapshot, getBookmarksServerSnapshot);
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function subscribeFollowed(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('followed-authors-updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('followed-authors-updated', callback);
  };
}

function getFollowedSnapshot(): string {
  if (typeof window === 'undefined') return '[]';
  return localStorage.getItem('novablog_followed_authors') || '[]';
}

function getFollowedServerSnapshot(): string {
  return '[]';
}

export function useFollowedAuthors(): string[] {
  const raw = useSyncExternalStore(subscribeFollowed, getFollowedSnapshot, getFollowedServerSnapshot);
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

