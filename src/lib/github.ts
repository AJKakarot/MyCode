export interface RepoInfo {
  owner: string;
  name: string;
  fullName: string;
  description: string | null;
  defaultBranch: string;
  stars: number;
  forks: number;
  isPrivate: boolean;
  avatarUrl: string;
  htmlUrl: string;
}

export interface TreeNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  children?: FileTreeNode[];
}

export function parseGitHubUrl(input: string): { owner: string; repo: string; branch?: string; path?: string } | null {
  const cleanInput = input.trim();
  if (!cleanInput) return null;

  // Case 1: Full URL e.g. https://github.com/owner/repo or https://github.com/owner/repo/blob/main/src/index.js
  const urlMatch = cleanInput.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/]+)(?:\/(?:tree|blob)\/([^/]+)(?:\/(.*))?)?/i
  );

  if (urlMatch) {
    const owner = urlMatch[1];
    const repo = urlMatch[2].replace(/\.git$/i, '');
    const branch = urlMatch[3];
    const path = urlMatch[4];
    return { owner, repo, branch, path };
  }

  // Case 2: Shorthand owner/repo
  const shortMatch = cleanInput.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2].replace(/\.git$/i, ''),
    };
  }

  return null;
}

export async function fetchRepoDetails(owner: string, repo: string, token?: string): Promise<RepoInfo> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Repository "${owner}/${repo}" not found or might be private.`);
    }
    if (res.status === 403) {
      const msg = await res.text();
      if (msg.includes('rate limit')) {
        throw new Error('GitHub API rate limit reached. Please add a GitHub Personal Access Token or try again later.');
      }
    }
    throw new Error(`Failed to fetch repo information: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    owner: data.owner.login,
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    defaultBranch: data.default_branch || 'main',
    stars: data.stargazers_count,
    forks: data.forks_count,
    isPrivate: data.private,
    avatarUrl: data.owner.avatar_url,
    htmlUrl: data.html_url,
  };
}

export async function fetchRepoTree(owner: string, repo: string, branch: string, token?: string): Promise<TreeNode[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to load repository tree: ${res.statusText}`);
  }

  const data = await res.json();
  if (!data.tree || !Array.isArray(data.tree)) {
    throw new Error('Repository file tree is empty or invalid.');
  }

  return data.tree;
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
  token?: string
): Promise<string> {
  // Use raw.githubusercontent.com for maximum speed and zero rate-limit issues on public files
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(rawUrl, { headers });
  if (!res.ok) {
    // Fallback to GitHub API content endpoint
    const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
      headers: {
        Accept: 'application/vnd.github.v3.raw',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!apiRes.ok) {
      throw new Error(`Failed to load file content (${res.status})`);
    }
    return await apiRes.text();
  }

  return await res.text();
}

/**
 * Builds a hierarchical tree from flat git tree array
 */
export function buildFileTree(nodes: TreeNode[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const node of nodes) {
    const parts = node.path.split('/');
    let currentLevel = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1 && node.type === 'blob';
      const currentPath = parts.slice(0, i + 1).join('/');

      let existingNode = currentLevel.find((item) => item.name === part);

      if (!existingNode) {
        existingNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          size: isFile ? node.size : undefined,
          children: isFile ? undefined : [],
        };
        currentLevel.push(existingNode);
      }

      if (!isFile && existingNode.children) {
        currentLevel = existingNode.children;
      }
    }
  }

  // Sort folders first, then files alphabetically
  const sortTree = (items: FileTreeNode[]) => {
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

    for (const item of items) {
      if (item.children) {
        sortTree(item.children);
      }
    }
  };

  sortTree(root);
  return root;
}

export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'jsx',
    ts: 'typescript',
    tsx: 'tsx',
    py: 'python',
    rb: 'ruby',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cc: 'cpp',
    h: 'c',
    hpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    php: 'php',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    json: 'json',
    yml: 'yaml',
    yaml: 'yaml',
    md: 'markdown',
    markdown: 'markdown',
    sh: 'bash',
    bash: 'bash',
    zsh: 'bash',
    sql: 'sql',
    graphql: 'graphql',
    gql: 'graphql',
    dockerfile: 'docker',
    xml: 'xml',
    svg: 'xml',
    toml: 'toml',
    ini: 'ini',
    swift: 'swift',
    kt: 'kotlin',
    dart: 'dart',
    lua: 'lua',
    r: 'r',
  };

  if (fileName.toLowerCase() === 'dockerfile') return 'docker';
  if (fileName.toLowerCase() === 'makefile') return 'makefile';

  return languageMap[ext] || 'plaintext';
}

export function isImageFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif'].includes(ext);
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined || bytes === null) return '';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
