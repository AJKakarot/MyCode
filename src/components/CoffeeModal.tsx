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
} from 'lucide-react';
import { WhatsappIcon } from './WhatsappIcon';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AMOUNTS = [
  { value: '20', label: '₹20', icon: '☕', name: 'Coffee' },
  { value: '50', label: '₹50', icon: '🥤', name: 'Cold Drink' },
  { value: '100', label: '₹100', icon: '🍕', name: 'Pizza Treat' },
  { value: '200', label: '₹200', icon: '🚀', name: 'Super Dev' },
];

const UPI_NUMBER = '8840713812';
const UPI_ID = '8840713812@upi';

export default function CoffeeModal({ isOpen, onClose }: CoffeeModalProps) {
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
      <div className="coffee-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="coffee-modal-header">
          <div className="coffee-header-title">
            <div className="coffee-icon-badge">
              <Coffee size={20} className="text-coffee" />
            </div>
            <div>
              <h3>Buy me a Coffee</h3>
              <p className="coffee-header-subtitle">Support GitCode development</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="coffee-modal-body">
          <p className="coffee-intro-text">
            If you like GitCode and it helps you explore codebases faster, consider fueling further updates with a small contribution! 💙
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
                width={140}
                height={140}
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

              {/* WhatsApp direct message */}
              <a
                href={`https://wa.me/918840713812?text=Hi%20Ajeet,%20I%20supported%20GitCode%20with%20%E2%82%B9${selectedAmount}!`}
                target="_blank"
                rel="noopener noreferrer"
                className="coffee-wa-btn"
              >
                <WhatsappIcon size={14} className="text-whatsapp" />
                <span>Message Ajeet (+91 8840713812)</span>
              </a>
            </div>
          </div>

          <div className="coffee-footer-note">
            <Heart size={13} className="text-danger" />
            <span>Thank you for your generous support!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
