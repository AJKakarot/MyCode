'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  Key,
  AlertCircle,
  Bookmark,
  Copy,
  Check,
  Trash2,
  ArrowRight,
  FolderGit2,
  Star,
  Lock,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { parseGitHubUrl } from '@/lib/github';
import { getSavedRepos, removeSavedRepo, SavedRepo } from '@/lib/savedRepos';

interface UserRepoItem {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  isPrivate: boolean;
}

interface RepoInputProps {
  onLoadRepo: (url: string, token?: string) => void;
  isLoading: boolean;
  error?: string | null;
  initialValue?: string;
  onOpenSavedModal?: () => void;
  githubUsername?: string | null;
}

const POPULAR_REPOS = [
  { label: 'facebook/react', url: 'facebook/react' },
  { label: 'vercel/next.js', url: 'vercel/next.js' },
  { label: 'tailwindlabs/tailwindcss', url: 'tailwindlabs/tailwindcss' },
  { label: 'shadcn-ui/ui', url: 'shadcn-ui/ui' },
  { label: 'torvalds/subsurface-for-dirk', url: 'torvalds/subsurface-for-dirk' },
];

export default function RepoInput({
  onLoadRepo,
  isLoading,
  error,
  initialValue = '',
  onOpenSavedModal,
  githubUsername,
}: RepoInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [patToken, setPatToken] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [savedRepos, setSavedRepos] = useState<SavedRepo[]>([]);
  const [copiedRepo, setCopiedRepo] = useState<string | null>(null);

  // Auto-suggestions for logged-in user's own repos
  const [userRepos, setUserRepos] = useState<UserRepoItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved repos
  useEffect(() => {
    const load = () => {
      setSavedRepos(getSavedRepos());
    };
    load();

    window.addEventListener('saved_repos_changed', load);
    return () => {
      window.removeEventListener('saved_repos_changed', load);
    };
  }, []);

  // Fetch logged in user's GitHub repositories for autocomplete suggestions
  useEffect(() => {
    async function fetchUserRepos() {
      try {
        const url = githubUsername
          ? `/api/user-repos?username=${encodeURIComponent(githubUsername)}`
          : `/api/user-repos`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.repos) && data.repos.length > 0) {
            setUserRepos(data.repos);
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    fetchUserRepos();
  }, [githubUsername]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter user's repos based on what is typed (or show recent repos when focused)
  const trimmed = inputValue.trim().toLowerCase();
  const matchingSuggestions = userRepos
    .filter((r) => {
      if (!trimmed) return true;
      return (
        r.name.toLowerCase().includes(trimmed) ||
        r.fullName.toLowerCase().includes(trimmed) ||
        (r.description && r.description.toLowerCase().includes(trimmed))
      );
    })
    .slice(0, 10);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInputError(null);
    setShowSuggestions(false);

    const val = inputValue.trim();
    if (!val) return;

    // If user typed only a repo name and they have a matching own repo or username
    if (!val.includes('/') && !val.startsWith('http') && githubUsername) {
      const match = userRepos.find((r) => r.name.toLowerCase() === val.toLowerCase());
      if (match) {
        onLoadRepo(match.fullName, patToken.trim() || undefined);
        return;
      }
      // If no exact match but user is logged in, try loading username/val
      onLoadRepo(`${githubUsername}/${val}`, patToken.trim() || undefined);
      return;
    }

    const parsed = parseGitHubUrl(val);
    if (!parsed) {
      setInputError('Please enter a valid repository name, owner/repo, or GitHub URL.');
      return;
    }

    onLoadRepo(val, patToken.trim() || undefined);
  };

  const handleSelectSuggestion = (fullName: string) => {
    setInputValue(fullName);
    setShowSuggestions(false);
    setInputError(null);
    onLoadRepo(fullName, patToken.trim() || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || matchingSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < matchingSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingSuggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(matchingSuggestions[selectedIndex].fullName);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleChipClick = (url: string) => {
    setInputValue(url);
    setInputError(null);
    onLoadRepo(url, patToken.trim() || undefined);
  };

  const handleCopyLink = async (repo: SavedRepo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(repo.htmlUrl);
      setCopiedRepo(repo.fullName);
      setTimeout(() => setCopiedRepo(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = repo.htmlUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedRepo(repo.fullName);
      setTimeout(() => setCopiedRepo(null), 2000);
    }
  };

  const handleRemoveSaved = (fullName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedRepo(fullName);
  };

  return (
    <div className="repo-input-wrapper" ref={containerRef}>
      <form onSubmit={handleSubmit} className="repo-input-form">
        <div className="input-group-container">
          <div className="input-group-main">
            <div className="input-icon-wrapper">
              <GithubIcon size={22} className="github-icon" />
            </div>

            <input
              type="text"
              placeholder={
                githubUsername
                  ? `Type your repo name (e.g. tcs) or owner/repo...`
                  : `https://github.com/owner/repo or owner/repo...`
              }
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (inputError) setInputError(null);
                setShowSuggestions(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => {
                if (userRepos.length > 0) setShowSuggestions(true);
              }}
              onClick={() => {
                if (userRepos.length > 0) setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              className="repo-text-input"
              autoFocus
              autoComplete="off"
            />

            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="repo-submit-btn"
            >
              {isLoading ? (
                <span className="btn-spinner"></span>
              ) : (
                <>
                  <Search size={18} />
                  <span>Explore Code</span>
                </>
              )}
            </button>
          </div>

          {/* Autocomplete Suggestions Popup for Logged-In User Repos */}
          {showSuggestions && matchingSuggestions.length > 0 && (
            <div className="repo-suggestions-dropdown">
              <div className="suggestions-header">
                <span className="suggestions-badge">
                  <GithubIcon size={12} />
                  <span>Your GitHub Repositories ({matchingSuggestions.length})</span>
                </span>
                <span className="suggestions-hint">Press ↑↓ to navigate</span>
              </div>
              <div className="suggestions-list">
                {matchingSuggestions.map((item, idx) => (
                  <div
                    key={item.fullName}
                    className={`suggestion-item ${selectedIndex === idx ? 'selected' : ''}`}
                    onClick={() => handleSelectSuggestion(item.fullName)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div className="suggestion-item-main">
                      <FolderGit2 size={16} className="text-accent" />
                      <div className="suggestion-info">
                        <div className="suggestion-name-row">
                          <span className="suggestion-name">{item.name}</span>
                          <span className="suggestion-fullname">{item.fullName}</span>
                          {item.isPrivate && <Lock size={11} className="text-muted" />}
                        </div>
                        {item.description && (
                          <p className="suggestion-desc">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="suggestion-right">
                      {item.stars > 0 && (
                        <span className="suggestion-stars">
                          <Star size={11} className="text-warning" />
                          {item.stars}
                        </span>
                      )}
                      <ArrowRight size={13} className="suggestion-arrow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional Personal Access Token Toggle */}
        <div className="pat-toggle-container">
          <button
            type="button"
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="pat-toggle-btn"
          >
            <Key size={13} />
            <span>{showTokenInput ? 'Hide GitHub Token' : 'Add GitHub Token (Optional for Private Repos / Higher Limit)'}</span>
          </button>

          {showTokenInput && (
            <div className="pat-input-wrapper">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (GitHub Personal Access Token)"
                value={patToken}
                onChange={(e) => setPatToken(e.target.value)}
                className="pat-input"
              />
              <span className="pat-hint">
                Token is only stored in memory on your browser and never saved.
              </span>
            </div>
          )}
        </div>
      </form>

      {/* Error display */}
      {(inputError || error) && (
        <div className="error-banner">
          <AlertCircle size={18} className="error-icon" />
          <span>{inputError || error}</span>
        </div>
      )}

      {/* User's Saved Repositories Section */}
      {savedRepos.length > 0 && (
        <div className="saved-chips-section">
          <div className="saved-chips-header">
            <span className="chips-label text-accent-label">
              <Bookmark size={14} className="text-accent" />
              <span>Your Saved Repositories ({savedRepos.length})</span>
            </span>
            {onOpenSavedModal && (
              <button
                type="button"
                onClick={onOpenSavedModal}
                className="saved-view-all-link"
              >
                <span>View all</span>
                <ArrowRight size={12} />
              </button>
            )}
          </div>

          <div className="saved-chips-grid">
            {savedRepos.slice(0, 6).map((repo) => {
              const isCopied = copiedRepo === repo.fullName;
              return (
                <div
                  key={repo.fullName}
                  className="saved-quick-chip"
                  onClick={() => handleChipClick(repo.fullName)}
                  role="button"
                  tabIndex={0}
                  title={`Open ${repo.fullName}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={repo.avatarUrl || `https://github.com/${repo.owner}.png`}
                    alt={repo.owner}
                    className="saved-chip-avatar"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="saved-chip-name">{repo.fullName}</span>

                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(repo, e)}
                    className={`saved-chip-icon-btn ${isCopied ? 'copied' : ''}`}
                    title="Copy GitHub link"
                  >
                    {isCopied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleRemoveSaved(repo.fullName, e)}
                    className="saved-chip-icon-btn remove"
                    title="Remove from saved"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sample Quick Chips */}
      <div className="popular-chips-bar">
        <span className="chips-label">
          <Sparkles size={14} className="text-accent" />
          Try popular repos:
        </span>
        <div className="chips-list">
          {POPULAR_REPOS.map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => handleChipClick(item.url)}
              disabled={isLoading}
              className="repo-chip"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
