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

const STORAGE_KEY = 'gitcode_saved_repos';

export function getSavedRepos(): SavedRepo[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRepo(repo: RepoInfo | Partial<SavedRepo> & { fullName: string }): SavedRepo[] {
  if (typeof window === 'undefined') return [];
  try {
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
      // Move to front and update details
      updated = [newEntry, ...current.filter((_, idx) => idx !== existsIndex)];
    } else {
      updated = [newEntry, ...current];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('saved_repos_changed'));

    // Save directly to Neon DB cloud via API
    fetch('/api/saved-repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry),
    }).catch((err) => {
      console.warn('Could not sync save to Neon DB:', err);
    });

    return updated;
  } catch {
    return getSavedRepos();
  }
}

export function removeSavedRepo(fullName: string): SavedRepo[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getSavedRepos();
    const updated = current.filter(
      (r) => r.fullName.toLowerCase() !== fullName.toLowerCase()
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('saved_repos_changed'));

    // Remove directly from Neon DB cloud via API
    fetch(`/api/saved-repos?fullName=${encodeURIComponent(fullName)}`, {
      method: 'DELETE',
    }).catch((err) => {
      console.warn('Could not sync delete to Neon DB:', err);
    });

    return updated;
  } catch {
    return getSavedRepos();
  }
}

export function isRepoSaved(fullName: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = getSavedRepos();
  return current.some((r) => r.fullName.toLowerCase() === fullName.toLowerCase());
}

/**
 * Syncs saved repos from Neon DB cloud with local storage
 */
export async function syncCloudSavedRepos(): Promise<SavedRepo[]> {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/api/saved-repos', { cache: 'no-store' });
    if (!res.ok) return getSavedRepos();
    const data = await res.json();
    if (data.authenticated && data.dbConfigured && Array.isArray(data.repos)) {
      const local = getSavedRepos();
      const map = new Map<string, SavedRepo>();

      // Put cloud items first (Neon DB is source of truth)
      for (const r of data.repos) {
        map.set(r.fullName.toLowerCase(), r);
      }
      // Add local items if not already present and sync them up to Neon DB
      for (const r of local) {
        if (!map.has(r.fullName.toLowerCase())) {
          map.set(r.fullName.toLowerCase(), r);
          // Push local item to Neon DB cloud
          fetch('/api/saved-repos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(r),
          }).catch(() => {});
        }
      }

      const merged = Array.from(map.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new Event('saved_repos_changed'));
      return merged;
    }
    return getSavedRepos();
  } catch {
    return getSavedRepos();
  }
}
