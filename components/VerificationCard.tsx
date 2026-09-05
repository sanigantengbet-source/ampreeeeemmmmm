'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  User,
  Mail,
  Calendar,
  Key,
  Code2,
  Download,
} from 'lucide-react';

interface VerificationCardProps {
  email: string;
  userData: any;
  raw: any;
  cookie: string;
}

export default function VerificationCard({
  email,
  userData,
  raw,
  cookie,
}: VerificationCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadJSON = () => {
    const payload = {
      verifiedAt: new Date().toISOString(),
      email,
      cookie,
      userData,
      raw,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `am-account-${email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const userObj = userData || raw?.data?.user || raw?.data || {};

  return (
    <div className="w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-4 sm:p-6 space-y-5">
      {/* Header Banner */}
      <div className="bg-emerald-300 border-3 border-black p-3.5 shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-lime-400 border-2 border-black flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 inline-block">
              SUCCESS VERIFIED
            </span>
            <h3 className="text-lg font-black tracking-tight text-black uppercase">
              Akun Berhasil Diverifikasi!
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={downloadJSON}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            title="Download JSON record backup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON</span>
          </button>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex-1 sm:flex-none px-3 py-1.5 bg-white hover:bg-neutral-100 border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showRaw ? 'Tutup JSON' : 'Raw JSON'}</span>
          </button>
        </div>
      </div>

      {/* Account Info Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
        {/* Email Card */}
        <div className="p-3 bg-neutral-50 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-black" />
              Email Target
            </span>
            <button
              onClick={() => copyToClipboard(email, 'email')}
              className="text-black hover:text-neutral-600 font-bold flex items-center gap-1"
            >
              {copiedKey === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'email' ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <p className="font-bold text-black text-sm break-all">{email}</p>
        </div>

        {/* User ID / Account ID */}
        <div className="p-3 bg-neutral-50 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-black" />
              User ID / Nama
            </span>
            {userObj.id && (
              <button
                onClick={() => copyToClipboard(String(userObj.id), 'userid')}
                className="text-black hover:text-neutral-600 font-bold flex items-center gap-1"
              >
                {copiedKey === 'userid' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'userid' ? 'Tersalin' : 'Salin'}</span>
              </button>
            )}
          </div>
          <p className="font-bold text-black text-sm break-all">
            {userObj.name || userObj.displayName || userObj.id || userObj.uid || 'Verified User'}
          </p>
        </div>

        {/* Status / Membership */}
        <div className="p-3 bg-cyan-100 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center justify-between text-neutral-700 mb-1">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              Status Akun
            </span>
            <span className="bg-lime-400 border border-black px-1.5 py-0.5 text-[10px] font-black uppercase text-black">
              ACTIVE
            </span>
          </div>
          <p className="font-black text-black text-sm">
            {userObj.subscription || userObj.status || userObj.tier || 'Alight Motion Member'}
          </p>
        </div>

        {/* Cookie Session string */}
        <div className="p-3 bg-amber-50 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <div className="flex items-center justify-between text-neutral-600 mb-1">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-black" />
              Session Cookie
            </span>
            <button
              onClick={() => copyToClipboard(cookie, 'cookie')}
              className="text-black hover:text-neutral-600 font-bold flex items-center gap-1"
            >
              {copiedKey === 'cookie' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'cookie' ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
          <p className="font-mono text-xs text-neutral-800 truncate" title={cookie}>
            {cookie ? `${cookie.slice(0, 24)}...${cookie.slice(-8)}` : 'Cookie Attached'}
          </p>
        </div>
      </div>

      {/* Raw JSON View */}
      {showRaw && (
        <div className="bg-black text-lime-300 p-3.5 border-3 border-black shadow-[3px_3px_0px_0px_#000] font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-neutral-400">
            <span className="font-bold uppercase text-white">Full JSON Response:</span>
            <button
              onClick={() => copyToClipboard(JSON.stringify(raw, null, 2), 'rawjson')}
              className="text-yellow-300 hover:text-yellow-200 flex items-center gap-1"
            >
              {copiedKey === 'rawjson' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === 'rawjson' ? 'JSON Tersalin!' : 'Salin JSON'}</span>
            </button>
          </div>
          <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-all text-[11px] leading-relaxed">
            {JSON.stringify(raw || userData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
