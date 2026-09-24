import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { AgencyContactConfig } from '../types';
import { ZazuLogo } from './ZazuLogo';

interface FloatingWhatsAppProps {
  agencyConfig: AgencyContactConfig;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ agencyConfig }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('Hi Vijayakumar, I am interested in creative digital marketing and video solutions for my business.');

  const targetNumber = '919789504702';
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent(customMsg)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Popup Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-2xl bg-[#111111] border border-[#25D366]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-5 space-y-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ZazuLogo variant="official" size="sm" showSubtitle={false} linkToHome={false} />
              <div className="leading-tight">
                <span className="text-xs font-bold text-white block">Vijayakumar • ZAZU Media</span>
                <span className="text-[10px] text-[#25D366] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  Online • +91 9789504702
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#A0A0A0] hover:text-white"
              aria-label="Close WhatsApp Chat Window"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-white/5 text-xs text-[#D4D4D4] leading-relaxed">
            Welcome to <strong className="text-white">ZAZU DIGITAL MEDIA</strong>. Located in Tirumangalam, Tamil Nadu. Message directly on WhatsApp to explore creative campaigns, video editing, and digital marketing.
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono-data text-[#A0A0A0] uppercase block">
              Direct Message:
            </label>
            <textarea
              rows={3}
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg bg-black border border-white/20 text-white focus:outline-none focus:border-[#25D366]"
            />
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20bd5a] text-[#080808] flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#25D366]/20"
          >
            <span>Message on WhatsApp (+91 9789504702)</span>
            <Send className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] text-[#080808] shadow-[0_10px_30px_rgba(37,211,102,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-none"
        aria-label="Direct WhatsApp Contact"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  );
};
