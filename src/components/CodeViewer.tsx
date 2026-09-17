'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
// Import common prism languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-graphql';

import { Copy, Check, FileCode, ExternalLink, Download, Layers } from 'lucide-react';
import { detectLanguage, formatBytes } from '@/lib/github';

interface CodeViewerProps {
  content: string;
  filePath: string;
  fileSize?: number;
  rawUrl?: string;
}

export default function CodeViewer({ content, filePath, fileSize, rawUrl }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const fileName = filePath.split('/').pop() || '';
  const language = useMemo(() => detectLanguage(fileName), [fileName]);

  const lines = useMemo(() => {
    return content.split('\n');
  }, [content]);

  useEffect(() => {
    // Re-highlight syntax whenever content or language changes
    Prism.highlightAll();
  }, [content, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="code-viewer-container">
      {/* File Header Bar */}
      <div className="code-header">
        <div className="code-header-left">
          <FileCode size={18} className="text-accent" />
          <span className="file-path">{filePath}</span>
          <span className="file-meta-badge">{language.toUpperCase()}</span>
          <span className="file-meta-badge">{lines.length} lines</span>
          {fileSize !== undefined && (
            <span className="file-meta-badge">{formatBytes(fileSize)}</span>
          )}
        </div>

        <div className="code-header-actions">
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`action-btn ${wrapLines ? 'active' : ''}`}
            title="Toggle Line Wrap"
          >
            <Layers size={15} />
            <span>Wrap</span>
          </button>

          <button
            onClick={handleCopy}
            className="action-btn"
            title="Copy Code"
          >
            {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="action-btn"
            title="Download file"
          >
            <Download size={15} />
            <span>Download</span>
          </button>

          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn"
              title="Open raw GitHub file"
            >
              <ExternalLink size={15} />
              <span>Raw</span>
            </a>
          )}
        </div>
      </div>

      {/* Code Area with Line Numbers */}
      <div className="code-body-wrapper">
        <div className="code-line-numbers" aria-hidden="true">
          {lines.map((_, index) => (
            <div key={index} className="line-number">
              {index + 1}
            </div>
          ))}
        </div>

        <pre className={`code-pre ${wrapLines ? 'wrap-lines' : ''}`}>
          <code className={`language-${language}`}>
            {content}
          </code>
        </pre>
      </div>
    </div>
  );
}
