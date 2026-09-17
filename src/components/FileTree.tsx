'use client';

import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  Image as ImageIcon,
  File,
  ChevronRight,
  ChevronDown,
  Search,
  ChevronsDown,
  ChevronsUp,
  FolderTree,
} from 'lucide-react';
import { FileTreeNode, isImageFile } from '@/lib/github';

interface FileTreeProps {
  tree: FileTreeNode[];
  selectedPath: string | null;
  onSelectFile: (path: string, size?: number) => void;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  if (isImageFile(fileName)) {
    return <ImageIcon size={16} className="tree-icon icon-image" />;
  }

  switch (ext) {
    case 'ts':
    case 'tsx':
      return <FileCode size={16} className="tree-icon icon-ts" />;
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return <FileCode size={16} className="tree-icon icon-js" />;
    case 'py':
      return <FileCode size={16} className="tree-icon icon-python" />;
    case 'json':
      return <FileJson size={16} className="tree-icon icon-json" />;
    case 'md':
    case 'markdown':
    case 'txt':
    case 'log':
      return <FileText size={16} className="tree-icon icon-text" />;
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return <FileCode size={16} className="tree-icon icon-css" />;
    case 'html':
    case 'htm':
      return <FileCode size={16} className="tree-icon icon-html" />;
    case 'go':
    case 'rs':
    case 'c':
    case 'cpp':
    case 'java':
    case 'rb':
    case 'php':
      return <FileCode size={16} className="tree-icon icon-code" />;
    default:
      return <File size={16} className="tree-icon icon-default" />;
  }
}

interface TreeItemProps {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | null;
  onSelectFile: (path: string, size?: number) => void;
  openFolders: Set<string>;
  toggleFolder: (path: string) => void;
  searchQuery: string;
}

function TreeItem({
  node,
  depth,
  selectedPath,
  onSelectFile,
  openFolders,
  toggleFolder,
  searchQuery,
}: TreeItemProps) {
  const isFolder = node.type === 'folder';
  const isOpen = openFolders.has(node.path) || searchQuery.trim().length > 0;
  const isSelected = selectedPath === node.path;

  if (isFolder) {
    return (
      <div className="tree-node-group">
        <div
          className={`tree-node folder-node ${isOpen ? 'open' : ''}`}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          onClick={() => toggleFolder(node.path)}
          role="button"
          tabIndex={0}
        >
          <span className="chevron-icon">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="folder-icon">
            {isOpen ? <FolderOpen size={16} className="text-folder" /> : <Folder size={16} className="text-folder" />}
          </span>
          <span className="node-name">{node.name}</span>
        </div>

        {isOpen && node.children && (
          <div className="tree-children">
            {node.children.map((child) => (
              <TreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedPath={selectedPath}
                onSelectFile={onSelectFile}
                openFolders={openFolders}
                toggleFolder={toggleFolder}
                searchQuery={searchQuery}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`tree-node file-node ${isSelected ? 'selected' : ''}`}
      style={{ paddingLeft: `${depth * 14 + 24}px` }}
      onClick={() => onSelectFile(node.path, node.size)}
      role="button"
      tabIndex={0}
    >
      {getFileIcon(node.name)}
      <span className="node-name">{node.name}</span>
    </div>
  );
}

export default function FileTree({ tree, selectedPath, onSelectFile }: FileTreeProps) {
  const [search, setSearch] = useState('');
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => {
    // Open top-level folders initially if any
    const initial = new Set<string>();
    tree.forEach((node) => {
      if (node.type === 'folder') initial.add(node.path);
    });
    return initial;
  });

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<string>();
    const collect = (nodes: FileTreeNode[]) => {
      nodes.forEach((n) => {
        if (n.type === 'folder') {
          all.add(n.path);
          if (n.children) collect(n.children);
        }
      });
    };
    collect(tree);
    setOpenFolders(all);
  };

  const collapseAll = () => {
    setOpenFolders(new Set());
  };

  // Filter tree recursively if search query is present
  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;

    const query = search.toLowerCase();

    const filterNodes = (nodes: FileTreeNode[]): FileTreeNode[] => {
      const result: FileTreeNode[] = [];

      for (const node of nodes) {
        if (node.type === 'file') {
          if (node.name.toLowerCase().includes(query) || node.path.toLowerCase().includes(query)) {
            result.push(node);
          }
        } else if (node.type === 'folder' && node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0 || node.name.toLowerCase().includes(query)) {
            result.push({
              ...node,
              children: filteredChildren,
            });
          }
        }
      }

      return result;
    };

    return filterNodes(tree);
  }, [tree, search]);

  return (
    <div className="file-tree-sidebar">
      {/* Tree Top Bar */}
      <div className="tree-top-bar">
        <div className="tree-title">
          <FolderTree size={16} />
          <span>Files</span>
        </div>
        <div className="tree-toolbar-actions">
          <button onClick={expandAll} className="icon-action-btn" title="Expand All">
            <ChevronsDown size={14} />
          </button>
          <button onClick={collapseAll} className="icon-action-btn" title="Collapse All">
            <ChevronsUp size={14} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="tree-search-bar">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Filter files (e.g. index.ts)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="tree-search-input"
        />
        {search && (
          <button onClick={() => setSearch('')} className="search-clear-btn">
            ×
          </button>
        )}
      </div>

      {/* Nodes List */}
      <div className="tree-content-list">
        {filteredTree.length === 0 ? (
          <div className="tree-empty-state">No matching files found.</div>
        ) : (
          filteredTree.map((node) => (
            <TreeItem
              key={node.path}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
              searchQuery={search}
            />
          ))
        )}
      </div>
    </div>
  );
}
