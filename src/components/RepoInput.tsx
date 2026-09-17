'use client';

import React, { useState } from 'react';
import { Search, Sparkles, Key, AlertCircle } from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { parseGitHubUrl } from '@/lib/github';

interface RepoInputProps {
  onLoadRepo: (url: string, token?: string) => void;
  isLoading: boolean;
  error?: string | null;
  initialValue?: string;
}

const POPULAR_REPOS = [
  { label: 'facebook/react', url: 'facebook/react' },
  { label: 'vercel/next.js', url: 'vercel/next.js' },
  { label: 'tailwindlabs/tailwindcss', url: 'tailwindlabs/tailwindcss' },
  { label: 'shadcn-ui/ui', url: 'shadcn-ui/ui' },
  { label: 'torvalds/subsurface-for-dirk', url: 'torvalds/subsurface-for-dirk' },
];

export default function RepoInput({ onLoadRepo, isLoading, error, initialValue = '' }: RepoInputProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [patToken, setPatToken] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

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

  return (
    <div className="repo-input-wrapper">
      <form onSubmit={handleSubmit} className="repo-input-form">
        <div className="input-group-main">
          <div className="input-icon-wrapper">
            <GithubIcon size={20} className="github-icon" />
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
                <Search size={16} />
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
