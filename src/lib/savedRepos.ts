'use client';

import { RepoInfo } from './github';

export interface SavedRepo {
  fullName: string;
  owner: string;
  name: string;
  description?: string | null;
  stars?: number;
  forks?: number;
  avatarUrl?: string;
  htmlUrl: string;
  savedAt: number;
}

// In-memory list for current session
let memorySavedRepos: SavedRepo[] = [];
let isAuthUser = false;

const CLOUD_CACHE_KEY = 'gitcode_cloud_saved_repos';

export function setAuthState(authenticated: boolean) {
  isAuthUser = authenticated;
  if (!authenticated && typeof window !== 'undefined') {
    // Clear any local cache so nothing persists for unauthenticated users
    localStorage.removeItem(CLOUD_CACHE_KEY);
    localStorage.removeItem('gitcode_saved_repos');
    memorySavedRepos = [];
    window.dispatchEvent(new Event('saved_repos_changed'));
  }
}

export function getSavedRepos(): SavedRepo[] {
  if (typeof window === 'undefined') return [];
  if (isAuthUser) {
    try {
      const raw = localStorage.getItem(CLOUD_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }
  return memorySavedRepos;
}

export function isRepoSaved(fullName: string): boolean {
  const current = getSavedRepos();
  return current.some((r) => r.fullName.toLowerCase() === fullName.toLowerCase());
}

export function saveRepo(repo: RepoInfo | Partial<SavedRepo> & { fullName: string }, authenticated?: boolean): SavedRepo[] {
  const isAuth = authenticated !== undefined ? authenticated : isAuthUser;
  const current = getSavedRepos();
  const existsIndex = current.findIndex(
    (r) => r.fullName.toLowerCase() === repo.fullName.toLowerCase()
  );

  const parts = repo.fullName.split('/');
  const owner = repo.owner || parts[0] || '';
  const name = repo.name || parts[1] || repo.fullName;

  const newEntry: SavedRepo = {
    fullName: repo.fullName,
    owner,
    name,
    description: repo.description || null,
    stars: repo.stars ?? 0,
    forks: repo.forks ?? 0,
    avatarUrl: repo.avatarUrl || `https://github.com/${owner}.png`,
    htmlUrl: repo.htmlUrl || `https://github.com/${repo.fullName}`,
    savedAt: Date.now(),
  };

  let updated: SavedRepo[];
  if (existsIndex >= 0) {
    updated = [newEntry, ...current.filter((_, idx) => idx !== existsIndex)];
  } else {
    updated = [newEntry, ...current];
  }

  memorySavedRepos = updated;

  if (isAuth && typeof window !== 'undefined') {
    // Save to local cache for instant UI
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(updated));
    // Persist permanently in Neon DB
    fetch('/api/saved-repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch((err) => {
      console.warn('Could not save to Neon DB:', err);
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('saved_repos_changed'));
  }

  return updated;
}

export function removeSavedRepo(fullName: string, authenticated?: boolean): SavedRepo[] {
  const isAuth = authenticated !== undefined ? authenticated : isAuthUser;
  const current = getSavedRepos();
  const updated = current.filter(
    (r) => r.fullName.toLowerCase() !== fullName.toLowerCase()
  );

  memorySavedRepos = updated;

  if (isAuth && typeof window !== 'undefined') {
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(updated));
    // Remove permanently from Neon DB
    fetch(`/api/saved-repos?fullName=${encodeURIComponent(fullName)}`, {
      method: 'DELETE',
    }).catch((err) => {
      console.warn('Could not delete from Neon DB:', err);
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('saved_repos_changed'));
  }

  return updated;
}

/**
 * Syncs saved repos from Neon DB cloud with local memory
 */
export async function syncCloudSavedRepos(): Promise<SavedRepo[]> {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/api/saved-repos', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.authenticated && data.dbConfigured && Array.isArray(data.repos)) {
      isAuthUser = true;
      memorySavedRepos = data.repos;
      localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(data.repos));
      window.dispatchEvent(new Event('saved_repos_changed'));
      return data.repos;
    } else if (!data.authenticated) {
      isAuthUser = false;
      memorySavedRepos = [];
      localStorage.removeItem(CLOUD_CACHE_KEY);
      localStorage.removeItem('gitcode_saved_repos');
      window.dispatchEvent(new Event('saved_repos_changed'));
    }
    return memorySavedRepos;
  } catch {
    return memorySavedRepos;
  }
}
