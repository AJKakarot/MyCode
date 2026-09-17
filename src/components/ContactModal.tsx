'use client';

import React, { useState } from 'react';
import {
  Coffee,
  X,
  Copy,
  Check,
  Smartphone,
  QrCode,
  Heart,
  ExternalLink,
  MessageCircle,
  Phone,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { WhatsappIcon } from './WhatsappIcon';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'contact' | 'coffee';
}

const AMOUNTS = [
  { value: '20', label: '₹20', icon: '☕', name: 'Coffee' },
  { value: '50', label: '₹50', icon: '🥤', name: 'Cold Drink' },
  { value: '100', label: '₹100', icon: '🍕', name: 'Pizza Treat' },
  { value: '200', label: '₹200', icon: '🚀', name: 'Super Dev' },
];

const PHONE_NUMBER = '+91 8840713812';
const UPI_NUMBER = '8840713812';
const UPI_ID = '8840713812@upi';

export default function ContactModal({
  isOpen,
  onClose,
  defaultTab = 'contact',
}: ContactModalProps) {
  const [activeTab, setActiveTab] = useState<'contact' | 'coffee'>(defaultTab);
  const [selectedAmount, setSelectedAmount] = useState('20');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=Ajeet%20Gupta&am=${selectedAmount}&cu=INR&tn=GitCode%20Coffee%20Support`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    upiIntentUrl
  )}&bgcolor=10-15-22&color=f0-f6-fc`;

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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="contact-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="contact-modal-header">
          <div className="contact-header-title">
            <div className="contact-icon-badge">
              {activeTab === 'coffee' ? (
                <Coffee size={20} className="text-coffee" />
              ) : (
                <MessageCircle size={20} className="text-accent" />
              )}
            </div>
            <div>
              <h3>Contact & Support</h3>
              <p className="contact-header-subtitle">Direct developer assistance & contributions</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="contact-tab-bar">
          <button
            type="button"
            className={`contact-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <WhatsappIcon size={15} className="text-whatsapp" />
            <span>Contact & Issues</span>
          </button>
          <button
            type="button"
            className={`contact-tab-btn ${activeTab === 'coffee' ? 'active' : ''}`}
            onClick={() => setActiveTab('coffee')}
          >
            <Coffee size={15} className="text-coffee" />
            <span>Buy me a Coffee (₹20)</span>
          </button>
        </div>

        {/* Tab 1: WhatsApp Contact & Issue Reporting */}
        {activeTab === 'contact' && (
          <div className="contact-modal-body">
            <div className="contact-hero-card">
              <div className="contact-hero-icon-box">
                <WhatsappIcon size={32} />
              </div>
              <div className="contact-hero-content">
                <h4>Have an issue, bug, or feedback?</h4>
                <p>Chat directly with Ajeet on WhatsApp for instant assistance or feature suggestions.</p>
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
                  <span className="contact-detail-label">Phone / WhatsApp</span>
                </div>
                <div className="contact-detail-right">
                  <span className="contact-detail-val">{PHONE_NUMBER}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(PHONE_NUMBER, 'phone')}
                    className="contact-copy-btn"
                  >
                    {copiedField === 'phone' ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    <span>{copiedField === 'phone' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="contact-detail-row">
                <div className="contact-detail-left">
                  <Globe size={15} className="text-accent" />
                  <span className="contact-detail-label">Developer Website</span>
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

            {/* Quick Switch to Coffee */}
            <div className="contact-switch-prompt" onClick={() => setActiveTab('coffee')}>
              <Coffee size={15} className="text-coffee" />
              <span>Like GitCode? Fuel development with a <strong>₹20 Coffee treat</strong> →</span>
            </div>
          </div>
        )}

        {/* Tab 2: Buy me a Coffee */}
        {activeTab === 'coffee' && (
          <div className="contact-modal-body">
            <p className="coffee-intro-text">
              GitCode is 100% free and open. If it saves your time exploring repos, consider fueling the project with a small treat! 💙
            </p>

            {/* Amount Selector */}
            <div className="coffee-amount-grid">
              {AMOUNTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`coffee-amount-card ${selectedAmount === item.value ? 'selected' : ''}`}
                  onClick={() => setSelectedAmount(item.value)}
                >
                  <span className="coffee-card-emoji">{item.icon}</span>
                  <span className="coffee-card-value">{item.label}</span>
                  <span className="coffee-card-name">{item.name}</span>
                </button>
              ))}
            </div>

            {/* Mobile Direct Pay Button */}
            <a
              href={upiIntentUrl}
              className="coffee-pay-upi-btn"
              title="Pay via UPI App (GPay / PhonePe / Paytm)"
            >
              <Smartphone size={16} />
              <span>Pay ₹{selectedAmount} via UPI App (PhonePe / GPay / Paytm)</span>
              <ExternalLink size={14} />
            </a>

            {/* QR Code & Manual Details */}
            <div className="coffee-payment-details">
              <div className="coffee-qr-wrapper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="Scan UPI QR Code"
                  className="coffee-qr-img"
                  width={130}
                  height={130}
                />
                <span className="coffee-qr-label">
                  <QrCode size={12} /> Scan with any UPI app
                </span>
              </div>

              <div className="coffee-manual-info">
                <div className="coffee-info-item">
                  <span className="coffee-info-label">UPI Mobile / Number</span>
                  <div className="coffee-copy-row">
                    <span className="coffee-info-val">{UPI_NUMBER}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(UPI_NUMBER, 'number')}
                      className="coffee-copy-btn"
                    >
                      {copiedField === 'number' ? (
                        <Check size={13} className="text-success" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>{copiedField === 'number' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="coffee-info-item">
                  <span className="coffee-info-label">UPI ID</span>
                  <div className="coffee-copy-row">
                    <span className="coffee-info-val">{UPI_ID}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(UPI_ID, 'upi')}
                      className="coffee-copy-btn"
                    >
                      {copiedField === 'upi' ? (
                        <Check size={13} className="text-success" />
                      ) : (
                        <Copy size={13} />
                      )}
                      <span>{copiedField === 'upi' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <a
                  href={`https://wa.me/918840713812?text=Hi%20Ajeet,%20I%20supported%20GitCode%20with%20%E2%82%B9${selectedAmount}!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="coffee-wa-btn"
                >
                  <WhatsappIcon size={14} className="text-whatsapp" />
                  <span>Message Ajeet on WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="coffee-footer-note">
              <Heart size={13} className="text-danger" />
              <span>Thank you for your generous support!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
