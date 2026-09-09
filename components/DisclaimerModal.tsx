'use client';

import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, Check, X } from 'lucide-react';

interface DisclaimerModalProps {
  channelUrl?: string;
}

export default function DisclaimerModal({
  channelUrl = 'https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L',
}: DisclaimerModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-5 sm:p-6 space-y-4 font-sans text-black">
        {/* Close Button Top-Right */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 p-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black font-bold shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          aria-label="Tutup Disclaimer"
        >
          <X className="w-4 h-4 text-black" />
        </button>

        {/* Header Section */}
        <div className="flex items-start gap-3 pr-8">
          <div className="w-10 h-10 bg-amber-300 border-3 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
            <ShieldAlert className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-black text-lime-400 px-2 py-0.5 inline-block">
              PEMBERITAHUAN RESMI
            </span>
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight mt-1 text-black">
              DISCLAIMER LAYANAN
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-3 font-mono text-xs text-neutral-800 leading-relaxed border-t-2 border-b-2 border-neutral-200 py-3">
          <p>
            Platform ini disediakan secara <strong>100% GRATIS</strong> untuk komunitas tanpa pungutan biaya apa pun.
          </p>
          <p>
            Pengembang <strong>tidak pernah memperjualbelikan</strong> akses layanan ataupun fitur yang ada di situs ini.
          </p>
          <div className="p-2.5 bg-neutral-50 border-2 border-black space-y-1.5">
            <span className="font-bold text-black uppercase text-[11px] block">
              Peringatan Tindakan Ilegal:
            </span>
            <p className="text-[11px] text-neutral-700">
              Jika Anda menemukan pihak atau oknum yang menjual atau mengomersialkan akses website ini, mohon segera laporkan melalui saluran komunikasi resmi di bawah ini.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1 font-mono">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 py-2.5 px-4 bg-lime-400 hover:bg-lime-300 text-black border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Lapor ke Saluran Resmi</span>
            </a>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto py-2.5 px-5 bg-black hover:bg-neutral-800 text-white border-2 border-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#FFE600] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-lime-400" />
              <span>Saya Mengerti</span>
            </button>
          </div>
        </div>

        {/* Small Bottom Credit Note */}
        <div className="pt-2 text-center border-t border-neutral-200">
          <span className="font-mono text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
            POWER BY SANN404 FORUM GROUP
          </span>
        </div>
      </div>
    </div>
  );
}
