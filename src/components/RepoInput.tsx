'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Key, AlertCircle, Bookmark, Copy, Check, Trash2, ArrowRight } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { parseGitHubUrl } from '@/lib/github';
import { getSavedRepos, removeSavedRepo, SavedRepo } from '@/lib/savedRepos';

interface RepoInputProps {
  onLoadRepo: (url: string, token?: string) => void;
  isLoading: boolean;
  error?: string | null;
  initialValue?: string;
  onOpenSavedModal?: () => void;
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
}: RepoInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [patToken, setPatToken] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [savedRepos, setSavedRepos] = useState<SavedRepo[]>([]);
  const [copiedRepo, setCopiedRepo] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const parsed = parseGitHubUrl(inputValue);
    if (!parsed) {
      setInputError('Please enter a valid GitHub URL (e.g., https://github.com/facebook/react) or owner/repo.');
      return;
    }

    onLoadRepo(inputValue, patToken.trim() || undefined);
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
    <div className="repo-input-wrapper">
      <form onSubmit={handleSubmit} className="repo-input-form">
        <div className="input-group-main">
          <div className="input-icon-wrapper">
            <GithubIcon size={22} className="github-icon" />
          </div>

          <input
            type="text"
            placeholder="https://github.com/owner/repo or owner/repo..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (inputError) setInputError(null);
            }}
            className="repo-text-input"
            autoFocus
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

