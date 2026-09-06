'use client';

import React from 'react';
import Image from 'next/image';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function Navbar() {
  return (
    <header className="w-full border-b-4 border-black bg-amber-300">
      {/* Top brutalist notice bar - Running ticker (marquee) */}
      <div className="bg-black text-white py-1.5 overflow-hidden whitespace-nowrap border-b-2 border-black flex select-none">
        <motion.div
          className="flex shrink-0 items-center"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            repeatType: 'loop',
            duration: 25,
            ease: 'linear',
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-5 px-4">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-lime-400 rounded-full animate-ping" />
                <span className="font-mono font-bold text-xs tracking-wider">
                  STATUS: SERVER AKTIF & ONLINE
                </span>
              </div>
              <span className="text-neutral-500 font-mono font-bold">|</span>
              <div className="flex items-center gap-2 font-bold text-amber-300 font-mono text-xs tracking-wider">
                <span>⚡ SISTEM VERIFIKASI AKUN ALIGHT MOTION</span>
              </div>
              <span className="text-neutral-500 font-mono font-bold">•</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 bg-[#171c2e] border-3 border-black shadow-[3px_3px_0px_0px_#000] rounded-sm overflow-hidden flex items-center justify-center shrink-0 rotate-[-2deg]">
            <Image
              src="/alight-motion-logo.png"
              alt="Logo Alight Motion"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              priority
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-black uppercase">
                AM PREM VERIFIER
              </h1>
              <span className="px-2 py-0.5 text-xs font-black bg-cyan-300 border-2 border-black shadow-[2px_2px_0px_0px_#000] rounded-sm uppercase">
                v2.0
              </span>
            </div>
            <p className="text-xs font-mono font-semibold text-neutral-800">
              Layanan Otomatisasi Pengiriman Magic Link & Verifikasi Akun
            </p>
          </div>
        </div>

        {/* Creator Channel Links */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <a
            href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-black" />
            <span>Saluran WhatsApp</span>
            <ExternalLink className="w-3 h-3 text-black" />
          </a>
        </div>
      </div>
    </header>
  );
}
