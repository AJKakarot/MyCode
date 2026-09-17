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

import { Copy, Check, FileCode, ExternalLink, Download, Layers, Plus, Minus } from 'lucide-react';
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
  const [fontSize, setFontSize] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gitcode_code_font_size');
      if (saved) {
        const num = Number(saved);
        if (!isNaN(num) && num >= 8 && num <= 24) return num;
      }
      if (window.innerWidth < 768) {
        return 11.5;
      }
    }
    return 13.5;
  });

  const fileName = filePath.split('/').pop() || '';
  const language = useMemo(() => detectLanguage(fileName), [fileName]);

  const lines = useMemo(() => {
    return content.split('\n');
  }, [content]);

  useEffect(() => {
    // Re-highlight syntax whenever content or language changes
    Prism.highlightAll();
  }, [content, language]);

  const handleZoomIn = () => {
    setFontSize((prev) => {
      const next = Math.min(24, Math.round((prev + 1) * 2) / 2);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gitcode_code_font_size', String(next));
      }
      return next;
    });
  };

  const handleZoomOut = () => {
    setFontSize((prev) => {
      const next = Math.max(8, Math.round((prev - 1) * 2) / 2);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gitcode_code_font_size', String(next));
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    const defaultSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 11.5 : 13.5;
    setFontSize(defaultSize);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gitcode_code_font_size', String(defaultSize));
    }
  };

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
          <FileCode size={16} className="text-accent flex-shrink-0" />
          <span className="file-path" title={filePath}>{filePath}</span>
          <span className="file-meta-badge">{language.toUpperCase()}</span>
          <span className="file-meta-badge hide-on-mobile">{lines.length} lines</span>
          {fileSize !== undefined && (
            <span className="file-meta-badge hide-on-mobile">{formatBytes(fileSize)}</span>
          )}
        </div>

        <div className="code-header-actions">
          {/* Zoom / Font Size +/- Controls */}
          <div className="font-size-control-group" title="Adjust code font size for easy reading">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={fontSize <= 8}
              className="font-size-btn"
              title="Decrease font size (-) to fit code on screen"
              aria-label="Decrease font size"
            >
              <Minus size={13} />
            </button>
            <span
              className="font-size-val"
              onClick={handleResetZoom}
              title="Click to reset font size"
            >
              {fontSize}px
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={fontSize >= 24}
              className="font-size-btn"
              title="Increase font size (+)"
              aria-label="Increase font size"
            >
              <Plus size={13} />
            </button>
          </div>

          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`action-btn ${wrapLines ? 'active' : ''}`}
            title="Toggle Line Wrap (Wrap code to screen width)"
          >
            <Layers size={14} />
            <span className="hide-on-mobile">Wrap</span>
          </button>

          <button
            onClick={handleCopy}
            className="action-btn"
            title="Copy Code"
          >
            {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            <span className="hide-on-mobile">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="action-btn"
            title="Download file"
          >
            <Download size={14} />
            <span className="hide-on-mobile">Download</span>
          </button>

          {rawUrl && (
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn hide-on-mobile"
              title="Open raw GitHub file"
            >
              <ExternalLink size={14} />
              <span>Raw</span>
            </a>
          )}
        </div>
      </div>

      {/* Code Area with Line Numbers */}
      <div
        className="code-body-wrapper"
        style={{
          ['--code-font-size' as any]: `${fontSize}px`,
          fontSize: `${fontSize}px`,
        }}
      >
        <div
          className="code-line-numbers"
          aria-hidden="true"
        >
          {lines.map((_, index) => (
            <div key={index} className="line-number">
              {index + 1}
            </div>
          ))}
        </div>

        <pre
          className={`code-pre ${wrapLines ? 'wrap-lines' : ''}`}
        >
          <code
            className={`language-${language}`}
          >
            {content}
          </code>
        </pre>
      </div>
    </div>
  );
}
