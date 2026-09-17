'use client';

import React from 'react';
import { Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { formatBytes } from '@/lib/github';

interface ImageViewerProps {
  filePath: string;
  fileSize?: number;
  rawUrl: string;
}

export default function ImageViewer({ filePath, fileSize, rawUrl }: ImageViewerProps) {
  const fileName = filePath.split('/').pop() || '';

  return (
    <div className="code-viewer-container">
      <div className="code-header">
        <div className="code-header-left">
          <ImageIcon size={18} className="text-accent" />
          <span className="file-path">{filePath}</span>
          <span className="file-meta-badge">IMAGE</span>
          {fileSize !== undefined && (
            <span className="file-meta-badge">{formatBytes(fileSize)}</span>
          )}
        </div>
        <div className="code-header-actions">
          <a
            href={rawUrl}
            download={fileName}
            className="action-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download size={15} />
            <span>Download</span>
          </a>
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn"
          >
            <ExternalLink size={15} />
            <span>Open Original</span>
          </a>
        </div>
      </div>

      <div className="image-viewer-body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={rawUrl} alt={fileName} className="preview-image" />
      </div>
    </div>
  );
}
