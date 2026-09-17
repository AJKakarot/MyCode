'use client';

import React from 'react';
import { RepoInfo } from '@/lib/github';
import { GitFork, Star, GitBranch, Lock, Globe, ExternalLink, RefreshCw, PanelLeftClose, PanelLeft } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

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
