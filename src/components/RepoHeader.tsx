'use client';

import React, { useState, useEffect } from 'react';
import { RepoInfo } from '@/lib/github';
import {
  GitFork,
  Star,
  GitBranch,
  Lock,
  Globe,
  ExternalLink,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';
import { isRepoSaved, saveRepo, removeSavedRepo } from '@/lib/savedRepos';

interface RepoHeaderProps {
  repo: RepoInfo;
  selectedBranch: string;
  onRefresh: () => void;
  isLoading: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function RepoHeader({
  repo,
  selectedBranch,
  onRefresh,
  isLoading,
  isSidebarOpen = true,
  onToggleSidebar,
}: RepoHeaderProps) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(isRepoSaved(repo.fullName));
    const handleSavedChange = () => {
      setSaved(isRepoSaved(repo.fullName));
    };
    window.addEventListener('saved_repos_changed', handleSavedChange);
    return () => {
      window.removeEventListener('saved_repos_changed', handleSavedChange);
    };
  }, [repo.fullName]);

  const handleToggleSave = () => {
    if (saved) {
      removeSavedRepo(repo.fullName);
      setSaved(false);
    } else {
      saveRepo(repo);
      setSaved(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(repo.htmlUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = repo.htmlUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="repo-header-container">
      <div className="repo-header-main">
        {/* Left: Sidebar Toggle + Repo Title & Avatar */}
        <div className="repo-identity">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="action-btn icon-only sidebar-toggle-btn"
              title={isSidebarOpen ? 'Collapse file tree' : 'Show file tree'}
            >
              {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={repo.avatarUrl} alt={repo.owner} className="repo-avatar" />
          <div className="repo-names">
            <span className="repo-owner">{repo.owner}</span>
            <span className="repo-slash">/</span>
            <span className="repo-name">{repo.name}</span>
            <span className="repo-badge">
              {repo.isPrivate ? <Lock size={11} /> : <Globe size={11} />}
              {repo.isPrivate ? 'Private' : 'Public'}
            </span>
          </div>
        </div>

        {/* Action badges & external links */}
        <div className="repo-stats-actions">
          <div className="repo-stat-chip">
            <GitBranch size={13} className="text-muted" />
            <span className="branch-name">{selectedBranch}</span>
          </div>

          <div className="repo-stat-chip hide-on-mobile">
            <Star size={13} className="text-warning" />
            <span>{repo.stars.toLocaleString()}</span>
          </div>

          <div className="repo-stat-chip hide-on-mobile">
            <GitFork size={13} className="text-info" />
            <span>{repo.forks.toLocaleString()}</span>
          </div>

          {/* Save / Bookmark Repo Button */}
          <button
            type="button"
            onClick={handleToggleSave}
            className={`action-btn ${saved ? 'repo-saved-active' : ''}`}
            title={saved ? 'Repository is Saved (Click to unsave)' : 'Save / Bookmark Repository'}
          >
            {saved ? (
              <>
                <BookmarkCheck size={14} className="text-accent" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark size={14} />
                <span>Save Repo</span>
              </>
            )}
          </button>

          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`action-btn ${copied ? 'copied' : ''}`}
            title="Copy GitHub URL"
          >
            {copied ? (
              <>
                <Check size={14} className="text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="hide-on-mobile">Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={onRefresh}
            className="action-btn icon-only"
            title="Reload repository"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
          </button>

          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
            title="Open on GitHub"
          >
            <GithubIcon size={14} />
            <span className="hide-on-mobile">GitHub</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {repo.description && (
        <p className="repo-description">{repo.description}</p>
      )}
    </div>
  );
}

