'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Code2,
  ArrowLeft,
  Coffee,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Phone,
  Globe,
  CreditCard,
} from 'lucide-react';
import { WhatsappIcon } from '@/components/WhatsappIcon';

const PHONE_NUMBER = '+91 8840713812';
const UPI_NUMBER = '8840713812';
const UPI_ID = '8840713812@upi';

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'coffee'>('contact');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="contact-page-wrapper">
      {/* Top Navigation */}
      <header className="auth-header">
        <Link href="/" className="auth-brand-link">
          <div className="brand-icon-box">
            <Code2 size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">GitCode</span>
            <span className="brand-subtitle">Repo Explorer</span>
          </div>
        </Link>
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={14} />
          <span>Back to Explorer</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="contact-page-main">
        <div className="contact-page-card">
          {/* Header Banner */}
          <div className="contact-card-header">
            <h1>Contact & Support</h1>
            <p>Report issues, request features, or fuel GitCode development.</p>
          </div>

          {/* Tab Switcher */}
          <div className="contact-full-tabs">
            <button
              type="button"
              className={`contact-full-tab ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              <WhatsappIcon size={16} className="text-whatsapp" />
              <span>WhatsApp & Contact</span>
            </button>
            <button
              type="button"
              className={`contact-full-tab ${activeTab === 'coffee' ? 'active' : ''}`}
              onClick={() => setActiveTab('coffee')}
            >
              <Coffee size={16} className="text-coffee" />
              <span>Buy me a Coffee</span>
            </button>
          </div>

          {/* Tab 1: WhatsApp Contact */}
          {activeTab === 'contact' && (
            <div className="contact-tab-content">
              <div className="contact-hero-card">
                <div className="contact-hero-icon-box">
                  <WhatsappIcon size={32} />
                </div>
                <div className="contact-hero-content">
                  <h4>Have an issue, bug, or question?</h4>
                  <p>
                    Message directly on WhatsApp for quick support, feature suggestions, or feedback.
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/918840713812?text=Hi%20Ajeet,%20I%20have%20an%20issue/feedback%20regarding%20GitCode"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-primary-wa-btn"
                title="Open WhatsApp Chat"
              >
                <WhatsappIcon size={18} />
                <span>Message on WhatsApp (+91 8840713812)</span>
                <ExternalLink size={15} />
              </a>

              <div className="contact-details-card">
                <div className="contact-detail-row">
                  <div className="contact-detail-left">
                    <Phone size={15} className="text-accent" />
                    <span className="contact-detail-label">Direct Phone / WhatsApp</span>
                  </div>
                  <div className="contact-detail-right">
                    <span className="contact-detail-val">{PHONE_NUMBER}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(PHONE_NUMBER, 'phone')}
                      className="contact-copy-btn"
                    >
                      {copiedField === 'phone' ? (
                        <Check size={12} className="text-success" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-detail-left">
                    <Globe size={15} className="text-accent" />
                    <span className="contact-detail-label">Developer Portfolio</span>
                  </div>
                  <div className="contact-detail-right">
                    <a
                      href="https://ajeetgupta.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-web-link"
                    >
                      <span>ajeetgupta.com</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Buy a Coffee (Identical size and structure to WhatsApp tab) */}
          {activeTab === 'coffee' && (
            <div className="contact-tab-content">
              <div className="contact-hero-card coffee-hero">
                <div className="contact-hero-icon-box coffee-hero-icon">
                  <Coffee size={32} />
                </div>
                <div className="contact-hero-content">
                  <h4>Support GitCode Development</h4>
                  <p>
                    Fuel further open-source updates and features by supporting via UPI.
                  </p>
                </div>
              </div>

              <a
                href="upi://pay?pa=8840713812@upi&pn=Ajeet%20Gupta&cu=INR&tn=GitCode%20Coffee%20Support"
                className="contact-primary-coffee-btn"
                title="Open UPI App to Pay"
              >
                <Coffee size={18} />
                <span>Pay via UPI App (PhonePe / GPay / Paytm)</span>
                <ExternalLink size={15} />
              </a>

              {/* Details Card */}
              <div className="contact-details-card">
                <div className="contact-detail-row">
                  <div className="contact-detail-left">
                    <Smartphone size={15} className="text-coffee" />
                    <span className="contact-detail-label">UPI Number</span>
                  </div>
                  <div className="contact-detail-right">
                    <span className="contact-detail-val">{UPI_NUMBER}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(UPI_NUMBER, 'number')}
                      className="contact-copy-btn"
                    >
                      {copiedField === 'number' ? (
                        <Check size={12} className="text-success" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedField === 'number' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="contact-detail-row">
                  <div className="contact-detail-left">
                    <CreditCard size={15} className="text-coffee" />
                    <span className="contact-detail-label">UPI ID</span>
                  </div>
                  <div className="contact-detail-right">
                    <span className="contact-detail-val">{UPI_ID}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(UPI_ID, 'upi')}
                      className="contact-copy-btn"
                    >
                      {copiedField === 'upi' ? (
                        <Check size={12} className="text-success" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedField === 'upi' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
