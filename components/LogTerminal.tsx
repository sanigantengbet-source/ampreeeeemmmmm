'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'cmd';
  text: string;
}

interface LogTerminalProps {
  logs: LogEntry[];
  onClear: () => void;
}

export default function LogTerminal({ logs, onClear }: LogTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-black text-lime-400 border-4 border-black shadow-[5px_5px_0px_0px_#000] font-mono text-xs overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="bg-neutral-900 border-b-2 border-neutral-700 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-black" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black" />
            <div className="w-3 h-3 rounded-full bg-green-500 border border-black" />
          </div>
          <span className="font-bold text-white flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-lime-400" />
            amv2_terminal.log
          </span>
          <span className="bg-neutral-800 text-neutral-400 text-[10px] px-2 py-0.5 rounded border border-neutral-700">
            {logs.length} baris
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 rounded text-[11px] flex items-center gap-1 transition-colors disabled:opacity-40"
            title="Salin Log"
          >
            {copied ? <Check className="w-3 h-3 text-lime-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            onClick={onClear}
            disabled={logs.length === 0}
            className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-600 rounded text-[11px] transition-colors disabled:opacity-40"
            title="Bersihkan Log"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-600 rounded text-[11px] transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {isExpanded && (
        <div className="p-3 max-h-56 sm:max-h-64 overflow-y-auto space-y-1 select-text scrollbar-thin">
          {logs.length === 0 ? (
            <div className="text-neutral-500 italic py-2">
              Belum ada aktivitas. Masukkan email dan kirim magic link untuk memulai...
            </div>
          ) : (
            logs.map((log) => {
              let color = 'text-lime-300';
              if (log.type === 'error') color = 'text-rose-400 font-bold';
              else if (log.type === 'warn') color = 'text-amber-300';
              else if (log.type === 'cmd') color = 'text-cyan-300 font-semibold';
              else if (log.type === 'success') color = 'text-emerald-400 font-bold';

              return (
                <div key={log.id} className="leading-relaxed flex items-start gap-2 break-all">
                  <span
                    className="text-neutral-500 select-none text-[11px] shrink-0"
                    suppressHydrationWarning
                  >
                    [{log.timestamp}]
                  </span>
                  <span className={`${color} flex-1`}>{log.text}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
