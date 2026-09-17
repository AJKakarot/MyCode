'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import RepoInput from '@/components/RepoInput';
import RepoHeader from '@/components/RepoHeader';
import FileTree from '@/components/FileTree';
import CodeViewer from '@/components/CodeViewer';
import MarkdownViewer from '@/components/MarkdownViewer';
import ImageViewer from '@/components/ImageViewer';
import SavedReposModal from '@/components/SavedReposModal';
import {
  parseGitHubUrl,
  fetchRepoDetails,
  fetchRepoTree,
  fetchFileContent,
  buildFileTree,
  isImageFile,
  RepoInfo,
  TreeNode,
  FileTreeNode,
} from '@/lib/github';
import {
  Code2,
  FolderGit2,
  FileText,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Bookmark,
  Coffee,
  MessageCircle,
} from 'lucide-react';
import { GithubIcon } from '@/components/GithubIcon';
import { WhatsappIcon } from '@/components/WhatsappIcon';
import InstallPrompt from '@/components/InstallPrompt';
import { getSavedRepos, syncCloudSavedRepos, setAuthState } from '@/lib/savedRepos';

export default function Home() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [rawTree, setRawTree] = useState<TreeNode[]>([]);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedFileSize, setSelectedFileSize] = useState<number | undefined>(undefined);
  const [fileContent, setFileContent] = useState<string>('');

  const [isLoadingRepo, setIsLoadingRepo] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Extract GitHub username if authenticated via GitHub
  const githubAccount = user?.externalAccounts?.find(
    (acc) =>
      acc.provider === 'github' ||
      acc.verification?.strategy === 'oauth_github'
  );
  const githubUsername =
    githubAccount?.username ||
    user?.username ||
    null;

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getSavedRepos().length);
    };
    updateCount();
    window.addEventListener('saved_repos_changed', updateCount);
    return () => {
      window.removeEventListener('saved_repos_changed', updateCount);
    };
  }, []);

  // Sync cloud saved repos with Neon DB when user signs in
  useEffect(() => {
    setAuthState(!!isSignedIn);
    if (isSignedIn) {
      syncCloudSavedRepos().then((repos) => {
        setSavedCount(repos.length);
      });
    } else {
      setSavedCount(0);
    }
  }, [isSignedIn]);

  // Load a file from the repository
  const loadFile = useCallback(
    async (path: string, size?: number, repoData?: RepoInfo, token?: string) => {
      const activeRepo = repoData || repoInfo;
      const activeToken = token !== undefined ? token : userToken;

      if (!activeRepo) return;

      setSelectedPath(path);
      setSelectedFileSize(size);
      setFileError(null);

      // If it's an image, we don't need text content
      if (isImageFile(path)) {
        setFileContent('');
        return;
      }

      setIsLoadingFile(true);
      try {
        const text = await fetchFileContent(
          activeRepo.owner,
          activeRepo.name,
          activeRepo.defaultBranch,
          path,
          activeToken
        );
        setFileContent(text);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load file content';
        setFileError(msg);
        setFileContent('');
      } finally {
        setIsLoadingFile(false);
      }
    },
    [repoInfo, userToken]
  );

  // Load repository structure
  const handleLoadRepo = async (inputUrl: string, token?: string) => {
    const parsed = parseGitHubUrl(inputUrl);
    if (!parsed) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }

    setIsLoadingRepo(true);
    setError(null);
    setFileError(null);
    setUserToken(token);

    try {
      // 1. Fetch Repo info
      const info = await fetchRepoDetails(parsed.owner, parsed.repo, token);
      setRepoInfo(info);

      // 2. Fetch Tree
      const tree = await fetchRepoTree(parsed.owner, parsed.repo, parsed.branch || info.defaultBranch, token);
      setRawTree(tree);

      const structuredTree = buildFileTree(tree);
      setFileTree(structuredTree);

      // 3. Auto-select README or target file if specified in URL
      let targetPath = parsed.path;
      if (!targetPath) {
        const readmeNode = tree.find(
          (node) => node.type === 'blob' && node.path.toLowerCase() === 'readme.md'
        );
        if (readmeNode) {
          targetPath = readmeNode.path;
        } else {
          const firstFile = tree.find((node) => node.type === 'blob');
          if (firstFile) {
            targetPath = firstFile.path;
          }
        }
      }

      if (targetPath) {
        const matchingNode = tree.find((node) => node.path === targetPath);
        await loadFile(targetPath, matchingNode?.size, info, token);
      } else {
        setSelectedPath(null);
        setFileContent('');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred while loading the repository.';
      setError(msg);
      setRepoInfo(null);
      setFileTree([]);
    } finally {
      setIsLoadingRepo(false);
    }
  };

  const handleReset = () => {
    setRepoInfo(null);
    setRawTree([]);
    setFileTree([]);
    setSelectedPath(null);
    setFileContent('');
    setError(null);
    setFileError(null);
  };

  // Helper for raw GitHub URL
  const currentRawUrl =
    repoInfo && selectedPath
      ? `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.name}/${repoInfo.defaultBranch}/${selectedPath}`
      : undefined;

  return (
    <div className="app-shell">
      {/* Navbar / Top Bar */}
      <header className="app-navbar">
        <div className="navbar-container">
          <div className="brand-badge" onClick={handleReset} role="button" tabIndex={0}>
            <div className="brand-icon-box">
              <Code2 size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">GitCode</span>
              <span className="brand-subtitle">Repo Explorer</span>
            </div>
          </div>

          <div className="navbar-right-actions">
            {repoInfo && (
              <div className="navbar-active-repo">
                <button onClick={handleReset} className="back-home-btn" title="Explore New Repository">
                  <ArrowLeft size={15} />
                  <span>New</span>
                </button>
                <div className="navbar-repo-badge hide-on-mobile">
                  <GithubIcon size={14} />
                  <span>{repoInfo.fullName}</span>
                </div>
              </div>
            )}

            {/* Saved Repositories Button */}
            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="navbar-saved-btn"
              title="View Saved Repositories"
            >
              <Bookmark size={14} className="text-accent" />
              <span className="hide-on-mobile">Saved</span>
              {savedCount > 0 && <span className="saved-badge-counter">{savedCount}</span>}
            </button>

            {/* Contact & Support Page Link */}
            <Link
              href="/contact"
              className="navbar-contact-btn"
              title="Contact on WhatsApp & Buy Coffee"
            >
              <MessageCircle size={14} className="text-accent" />
              <span className="hide-on-mobile">Contact</span>
            </Link>

            {/* Clerk GitHub Auth */}
            {isLoaded && isSignedIn ? (
              <div className="navbar-user-group">
                {githubUsername && (
                  <span className="navbar-github-handle hide-on-mobile">
                    @{githubUsername}
                  </span>
                )}
                <UserButton />
              </div>
            ) : isLoaded ? (
              <SignUpButton mode="modal" fallbackRedirectUrl="/" signInFallbackRedirectUrl="/">
                <button className="navbar-github-login-btn" title="Sign In with GitHub">
                  <GithubIcon size={16} />
                  <span className="hide-on-mobile">GitHub Login</span>
                </button>
              </SignUpButton>
            ) : null}

            <InstallPrompt />
          </div>
        </div>
      </header>

      {/* Main Content View */}
      {!repoInfo ? (
        /* Home Landing Screen */
        <main className="hero-landing-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} className="text-accent" />
              <span>Fast GitHub Repository & Code Reader</span>
            </div>

            <h1 className="hero-title">
              Explore and Read Any <span className="gradient-text">GitHub Codebase</span>
            </h1>

            <p className="hero-description">
              Paste any GitHub repository link below to browse folder structures and read code with syntax highlighting.
            </p>

            {/* Input Component with live auto-suggestions for logged-in user repos */}
            <RepoInput
              onLoadRepo={handleLoadRepo}
              isLoading={isLoadingRepo}
              error={error}
              onOpenSavedModal={() => setShowSavedModal(true)}
              githubUsername={githubUsername}
            />

          </div>

          {/* Footer */}
          <footer className="landing-footer">
            <p>
              Designed & Built by{' '}
              <a
                href="https://ajeetgupta.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-author"
              >
                ajeetgupta
              </a>
            </p>
          </footer>
        </main>
      ) : (
        /* Repository Explorer View */
        <main className="explorer-layout">
          {/* Top Repository Details Header */}
          <RepoHeader
            repo={repoInfo}
            selectedBranch={repoInfo.defaultBranch}
            onRefresh={() => handleLoadRepo(repoInfo.fullName, userToken)}
            isLoading={isLoadingRepo}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Main Workspace: Sidebar File Tree + Code Display */}
          <div className="explorer-workspace">
            {/* Left Sidebar */}
            <aside className={`explorer-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
              <FileTree
                tree={fileTree}
                selectedPath={selectedPath}
                onSelectFile={(path, size) => {
                  loadFile(path, size);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
              />
            </aside>

            {/* Right Stage: Code Viewer */}
            <section className="explorer-viewer">
              {isLoadingFile ? (
                <div className="viewer-loading-state">
                  <Loader2 size={36} className="spin-anim text-accent" />
                  <p>Loading file content...</p>
                </div>
              ) : fileError ? (
                <div className="viewer-error-state">
                  <AlertTriangle size={36} className="text-danger" />
                  <h3>Failed to load file</h3>
                  <p>{fileError}</p>
                </div>
              ) : !selectedPath ? (
                <div className="viewer-empty-state">
                  <FolderGit2 size={48} className="empty-icon" />
                  <h3>No file selected</h3>
                  <p>Select any file from the sidebar on the left to start reading code.</p>
                </div>
              ) : isImageFile(selectedPath) ? (
                <ImageViewer
                  filePath={selectedPath}
                  fileSize={selectedFileSize}
                  rawUrl={currentRawUrl || ''}
                />
              ) : selectedPath.toLowerCase().endsWith('.md') || selectedPath.toLowerCase().endsWith('.markdown') ? (
                <MarkdownViewer
                  content={fileContent}
                  filePath={selectedPath}
                  fileSize={selectedFileSize}
                  rawUrl={currentRawUrl}
                />
              ) : (
                <CodeViewer
                  content={fileContent}
                  filePath={selectedPath}
                  fileSize={selectedFileSize}
                  rawUrl={currentRawUrl}
                />
              )}
            </section>
          </div>
        </main>
      )}

      {/* Saved Repositories Modal */}
      <SavedReposModal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        onSelectRepo={(url) => handleLoadRepo(url, userToken)}
      />
    </div>
  );
}
