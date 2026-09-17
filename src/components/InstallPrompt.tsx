'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Share, PlusSquare, X, CheckCircle2, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone/installed mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for beforeinstallprompt (Android / Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Chrome direct install prompt
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // iOS or browser without direct prompt -> Open guidance modal
      setShowModal(true);
    }
  };

  // If already running as an installed standalone app, don't show the install button
  if (isStandalone || installed) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="shortcut-install-btn"
        title="Add to Android / iPhone Home Screen"
      >
        <Smartphone size={14} className="text-accent" />
        <span>Add Shortcut</span>
      </button>

      {/* Instructional Modal for iOS & Android */}
      {showModal && (
        <div className="install-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="install-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="install-modal-header">
              <div className="modal-title-group">
                <Smartphone size={18} className="text-accent" />
                <h3>Add Shortcut to Home Screen</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="install-modal-body">
              {isIOS ? (
                /* iOS Safari Instructions */
                <div className="instructions-section">
                  <p className="instruction-lead">
                    To add <strong>GitCode</strong> to your iPhone/iPad Home Screen:
                  </p>
                  <ol className="steps-list">
                    <li className="step-item">
                      <span className="step-num">1</span>
                      <div className="step-content">
                        Tap the <strong>Share</strong> button at the bottom of Safari.
                        <div className="step-visual">
                          <Share size={18} className="text-accent" /> <span>Share Button</span>
                        </div>
                      </div>
                    </li>
                    <li className="step-item">
                      <span className="step-num">2</span>
                      <div className="step-content">
                        Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.
                        <div className="step-visual">
                          <PlusSquare size={18} className="text-accent" /> <span>Add to Home Screen</span>
                        </div>
                      </div>
                    </li>
                    <li className="step-item">
                      <span className="step-num">3</span>
                      <div className="step-content">
                        Tap <strong>Add</strong> in the top-right corner.
                      </div>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Android / Chrome Instructions */
                <div className="instructions-section">
                  <p className="instruction-lead">
                    To install <strong>GitCode</strong> shortcut on Android / Desktop:
                  </p>
                  <ol className="steps-list">
                    <li className="step-item">
                      <span className="step-num">1</span>
                      <div className="step-content">
                        Tap the browser menu <strong>(⋮ or three dots)</strong> in Chrome/Edge.
                      </div>
                    </li>
                    <li className="step-item">
                      <span className="step-num">2</span>
                      <div className="step-content">
                        Select <strong>&quot;Add to Home screen&quot;</strong> or <strong>&quot;Install app&quot;</strong>.
                        <div className="step-visual">
                          <Download size={18} className="text-accent" /> <span>Install App</span>
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="install-modal-footer">
              <button onClick={() => setShowModal(false)} className="modal-done-btn">
                <CheckCircle2 size={16} />
                <span>Got It</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
