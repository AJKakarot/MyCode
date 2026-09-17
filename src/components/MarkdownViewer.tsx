'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Eye, Code as CodeIcon, Copy, Check, ExternalLink, Download } from 'lucide-react';
import CodeViewer from './CodeViewer';
import { formatBytes } from '@/lib/github';

interface MarkdownViewerProps {
  content: string;
  filePath: string;
  fileSize?: number;
  rawUrl?: string;
}

export default function MarkdownViewer({ content, filePath, fileSize, rawUrl }: MarkdownViewerProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const fileName = filePath.split('/').pop() || '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="markdown-view-container">
      {/* Header bar */}
      <div className="code-header">
        <div className="code-header-left">
          <div className="toggle-group">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`toggle-tab ${viewMode === 'preview' ? 'active' : ''}`}
            >
              <Eye size={15} /> Preview
            </button>
            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`toggle-tab ${viewMode === 'code' ? 'active' : ''}`}
            >
              <CodeIcon size={15} /> Raw Code
            </button>
          </div>
          <span className="file-path">{filePath}</span>
          {fileSize !== undefined && (
            <span className="file-meta-badge">{formatBytes(fileSize)}</span>
          )}
        </div>

        <div className="code-header-actions">
          <button onClick={handleCopy} className="action-btn" title="Copy Markdown">
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span className="hide-on-mobile">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button onClick={handleDownload} className="action-btn" title="Download">
            <Download size={14} />
            <span className="hide-on-mobile">Download</span>
          </button>
          {rawUrl && (
            <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="action-btn hide-on-mobile">
              <ExternalLink size={14} />
              <span>Raw</span>
            </a>
          )}
        </div>
      </div>

      {/* Main View: Either rendered Markdown or CodeViewer */}
      {viewMode === 'code' ? (
        <CodeViewer content={content} filePath={filePath} fileSize={fileSize} rawUrl={rawUrl} />
      ) : (
        <div className="markdown-rendered-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
