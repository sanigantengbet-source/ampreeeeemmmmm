'use client';

import React, { useState } from 'react';
import { History, Trash2, Copy, Check, ChevronDown, ChevronUp, Download, FileJson } from 'lucide-react';

export interface VerifiedRecord {
  id: string;
  email: string;
  cookie: string;
  timestamp: string;
  userData: any;
  raw: any;
}

interface HistorySectionProps {
  records: VerifiedRecord[];
  onClear: () => void;
  onSelect: (record: VerifiedRecord) => void;
}

export default function HistorySection({
  records,
  onClear,
  onSelect,
}: HistorySectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (records.length === 0) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadAllJSON = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      source: 'AM Prem Verifier',
      totalRecords: records.length,
      records: records,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `am-verified-backup-${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSingleJSON = (record: VerifiedRecord) => {
    const recordData = {
      exportDate: new Date().toISOString(),
      source: 'AM Prem Verifier',
      ...record,
    };
    const blob = new Blob([JSON.stringify(recordData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `am-account-${record.email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full bg-white border-4 border-black shadow-[5px_5px_0px_0px_#000] p-4 font-mono">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left font-black uppercase text-sm text-black hover:text-neutral-700"
        >
          <History className="w-4 h-4 text-black" />
          <span>RIWAYAT AKUN TERVERIFIKASI ({records.length})</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Download JSON Bulk Backup Button */}
          <button
            onClick={handleDownloadAllJSON}
            className="px-2.5 py-1.5 text-xs bg-yellow-300 hover:bg-yellow-200 text-black border-2 border-black font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            title="Download JSON Backup untuk semua riwayat akun"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON Backup</span>
          </button>

          <button
            onClick={onClear}
            className="px-2 py-1.5 text-xs bg-rose-200 hover:bg-rose-300 text-rose-900 border-2 border-black font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Trash2 className="w-3 h-3" />
            <span>Hapus Semua</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-3 bg-neutral-100 border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs hover:bg-neutral-50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-black">{rec.email}</span>
                  <span className="text-[10px] bg-lime-300 border border-black px-1.5 py-0.2 font-black">
                    VERIFIED
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">{rec.timestamp}</span>
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={() => onSelect(rec)}
                  className="px-2 py-1 bg-cyan-300 hover:bg-cyan-200 border-2 border-black font-bold text-[11px] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Lihat Detail
                </button>
                <button
                  onClick={() => handleDownloadSingleJSON(rec)}
                  className="px-2 py-1 bg-yellow-200 hover:bg-yellow-100 border-2 border-black font-bold text-[11px] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1"
                  title="Unduh JSON akun ini"
                >
                  <FileJson className="w-3 h-3 text-neutral-800" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={() => handleCopy(rec.email, rec.id)}
                  className="px-2 py-1 bg-white hover:bg-neutral-200 border-2 border-black font-bold text-[11px] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1"
                >
                  {copiedId === rec.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === rec.id ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
