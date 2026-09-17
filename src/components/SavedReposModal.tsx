'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@clerk/nextjs';
import {
  Bookmark,
  X,
  Search,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Star,
  GitFork,
  ArrowRight,
  FolderGit2,
  Cloud,
} from 'lucide-react';
import { SavedRepo, getSavedRepos, removeSavedRepo, syncCloudSavedRepos } from '@/lib/savedRepos';

interface SavedReposModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repoUrl: string) => void;
}

export default function SavedReposModal({
  isOpen,
  onClose,
  onSelectRepo,
}: SavedReposModalProps) {
  const { isSignedIn } = useUser();
  const [savedRepos, setSavedRepos] = useState<SavedRepo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedRepo, setCopiedRepo] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const load = () => {
      setSavedRepos(getSavedRepos());
    };
    load();

    window.addEventListener('saved_repos_changed', load);
    return () => {
      window.removeEventListener('saved_repos_changed', load);
    };
  }, []);

  // When modal is opened, sync fresh from Neon DB
  useEffect(() => {
    if (isOpen && isSignedIn) {
      setIsSyncing(true);
      syncCloudSavedRepos()
        .then((repos) => {
          setSavedRepos(repos);
        })
        .finally(() => {
          setIsSyncing(false);
        });
    }
  }, [isOpen, isSignedIn]);

  const handleCopyLink = async (repo: SavedRepo, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(repo.htmlUrl);
      setCopiedRepo(repo.fullName);
      setTimeout(() => {
        setCopiedRepo(null);
      }, 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = repo.htmlUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedRepo(repo.fullName);
      setTimeout(() => {
        setCopiedRepo(null);
      }, 2000);
    }
  };

  const handleDelete = (fullName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSavedRepo(fullName, isSignedIn);
  };

  const handleOpenRepo = (fullName: string) => {
    onSelectRepo(fullName);
    onClose();
  };

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const filteredRepos = savedRepos.filter(
    (r) =>
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const modalContent = (
    <div className="install-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="saved-repos-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="saved-modal-header">
          <div className="saved-modal-title-group">
            <div className="saved-icon-badge">
              <Bookmark size={18} className="text-accent" />
            </div>
            <div>
              <h3 className="saved-modal-title">Saved Repositories</h3>
              <p className="saved-modal-subtitle">
                {savedRepos.length} {savedRepos.length === 1 ? 'repository' : 'repositories'} saved
                {isSignedIn && (
                  <span className="saved-cloud-badge">
                    <Cloud size={11} className="text-accent" />
                    {isSyncing ? 'Syncing with Neon DB...' : 'Neon DB Synced'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Search Bar if > 3 items */}
        {savedRepos.length > 3 && (
          <div className="saved-search-bar">
            <Search size={15} className="text-muted" />
            <input
              type="text"
              placeholder="Filter saved repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="saved-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="saved-search-clear"
                title="Clear filter"
              >
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="saved-modal-body">
          {savedRepos.length === 0 ? (
            <div className="saved-empty-state">
              <div className="saved-empty-icon">
                <FolderGit2 size={36} />
              </div>
              <h4>No saved repositories yet</h4>
              <p>
                When you explore any GitHub repository, tap <strong>Save Repo</strong> in the header
                to bookmark it for instant access and link copying anytime.
              </p>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="saved-empty-state">
              <p className="text-muted">No repositories match &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <div className="saved-repos-list">
              {filteredRepos.map((repo) => {
                const isCopied = copiedRepo === repo.fullName;

                return (
                  <div
                    key={repo.fullName}
                    className="saved-repo-card"
                    onClick={() => handleOpenRepo(repo.fullName)}
                  >
                    <div className="saved-repo-main">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={repo.avatarUrl || `https://github.com/${repo.owner}.png`}
                        alt={repo.owner}
                        className="saved-repo-avatar"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="saved-repo-details">
                        <div className="saved-repo-name-row">
                          <span className="saved-repo-name">{repo.fullName}</span>
                        </div>
                        {repo.description && (
                          <p className="saved-repo-desc">{repo.description}</p>
                        )}
                        <div className="saved-repo-meta">
                          {repo.stars !== undefined && repo.stars > 0 && (
                            <span className="saved-meta-item">
                              <Star size={11} className="text-warning" />
                              {repo.stars.toLocaleString()}
                            </span>
                          )}
                          {repo.forks !== undefined && repo.forks > 0 && (
                            <span className="saved-meta-item">
                              <GitFork size={11} className="text-info" />
                              {repo.forks.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="saved-repo-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(repo, e)}
                        className={`saved-action-btn ${isCopied ? 'copied' : ''}`}
                        title="Copy GitHub Link"
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} className="text-success" />
                            <span className="text-success">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="saved-action-btn icon-only"
                        title="Open on GitHub"
                      >
                        <ExternalLink size={14} />
                      </a>

                      <button
                        type="button"
                        onClick={(e) => handleDelete(repo.fullName, e)}
                        className="saved-action-btn icon-only delete"
                        title="Remove from saved"
                      >
                        <Trash2 size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenRepo(repo.fullName)}
                        className="saved-explore-btn"
                        title="Open repository in GitCode"
                      >
                        <span>Open</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="saved-modal-footer">
          <span className="saved-footer-tip">
            {isSignedIn
              ? '☁️ Saved repositories are saved to your Neon Database account.'
              : '💡 Sign in with GitHub to save & sync repositories in Neon Database.'}
          </span>
          <button onClick={onClose} className="modal-done-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
