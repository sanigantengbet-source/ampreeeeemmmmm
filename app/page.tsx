'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LogTerminal, { LogEntry } from '@/components/LogTerminal';
import VerificationCard from '@/components/VerificationCard';
import HistorySection, { VerifiedRecord } from '@/components/HistorySection';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Link as LinkIcon,
  RefreshCw,
  KeyRound,
  ExternalLink,
  Sparkles,
  HelpCircle,
  ClipboardPaste,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'init-1',
    timestamp: 'READY',
    type: 'info',
    text: 'Sistem Verifikasi Akun Alight Motion siap digunakan.',
  },
  {
    id: 'init-2',
    timestamp: 'READY',
    type: 'cmd',
    text: 'Silakan masukkan alamat email akun Anda lalu klik "Kirim Link".',
  },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [cookie, setCookie] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Loading states
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info' | null;
    text: string;
  }>({ type: null, text: '' });

  // Verification result
  const [verificationResult, setVerificationResult] = useState<{
    userData: any;
    raw: any;
  } | null>(null);

  // Activity logs
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  // History records
  const [history, setHistory] = useState<VerifiedRecord[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Safe client-side hydration for history
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('am_verified_history');
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch {
        // Ignore local storage error
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addLog = (text: string, type: LogEntry['type'] = 'info') => {
    const timeStr = typeof window !== 'undefined' ? new Date().toLocaleTimeString() : 'LOG';
    const newEntry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timeStr,
      type,
      text,
    };
    setLogs((prev) => [...prev, newEntry]);
  };

  const clearLogs = () => {
    setLogs([
      {
        id: `clear-${Date.now()}`,
        timestamp: 'CLEARED',
        type: 'info',
        text: 'Log konsol dibersihkan.',
      },
    ]);
  };

  // Step 1: Send verification link
  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: 'Silakan masukkan alamat email!' });
      addLog('❌ Error: Email tidak boleh kosong', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setStatusMessage({ type: 'error', text: 'Format alamat email tidak valid!' });
      addLog('❌ Error: Format email tidak valid', 'error');
      return;
    }

    setIsSending(true);
    setStatusMessage({ type: 'info', text: 'Menginisialisasi session cookie & mengirim link...' });
    addLog(`[*] Initializing session for: ${email.trim()}...`, 'cmd');

    try {
      const res = await fetch('/api/am/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          cookie: cookie.trim() || undefined,
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Respons server tidak valid (HTTP ${res.status}). Silakan coba lagi.`);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Gagal mengirim link`);
      }

      if (data.cookie) {
        setCookie(data.cookie);
        addLog(`[*] Session ready. (cookie: ${data.cookie.slice(0, 15)}...)`, 'info');
      }

      addLog(`[*] Sending verification link to: ${email.trim()}`, 'cmd');
      addLog(`✅ Verification link sent successfully!`, 'success');
      addLog(`💡 Check your inbox at ${email.trim()}, then paste the full magic link below:`, 'warn');

      setStatusMessage({
        type: 'success',
        text: `Link verifikasi terkirim ke ${email.trim()}! Silakan periksa inbox / spam email Anda.`,
      });

      // Move to Step 2
      setStep(2);
    } catch (err: any) {
      const msg = err.message || 'Gagal mengirim link verifikasi';
      addLog(`❌ ERROR: ${msg}`, 'error');
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSending(false);
    }
  };

  // Step 2: Verify magic link
  const handleVerifyLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: 'Email wajib diisi!' });
      return;
    }

    if (!magicLink.trim() || magicLink.trim().length < 10) {
      setStatusMessage({ type: 'error', text: 'Silakan tempelkan Magic Link yang valid dari email Anda!' });
      addLog('❌ Error: Magic link tidak valid atau terlalu pendek', 'error');
      return;
    }

    if (!cookie.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Session cookie hilang. Silakan kirim ulang link verifikasi di Step 1.',
      });
      addLog('❌ Error: Session cookie tidak ditemukan. Ulangi Step 1.', 'error');
      return;
    }

    setIsVerifying(true);
    setStatusMessage({ type: 'info', text: 'Memverifikasi Magic Link...' });
    addLog(`[*] Verifying magic link...`, 'cmd');

    try {
      const res = await fetch('/api/am/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          link: magicLink.trim(),
          cookie: cookie.trim(),
        }),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(`Respons server tidak valid (HTTP ${res.status}). Silakan coba lagi.`);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || `HTTP ${res.status}: Verifikasi gagal`);
      }

      addLog(`✅ VERIFICATION SUCCESSFUL!`, 'success');
      addLog(`UserData: ${JSON.stringify(data.userData || data.raw)}`, 'info');

      setVerificationResult({
        userData: data.userData,
        raw: data.raw,
      });

      setStatusMessage({
        type: 'success',
        text: 'Akun Alight Motion berhasil diverifikasi!',
      });

      // Save to local history
      const newRecord: VerifiedRecord = {
        id: `rec-${Date.now()}`,
        email: email.trim(),
        cookie: cookie.trim(),
        timestamp: new Date().toLocaleString(),
        userData: data.userData,
        raw: data.raw,
      };

      const updatedHistory = [newRecord, ...history.slice(0, 19)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('am_verified_history', JSON.stringify(updatedHistory));
      } catch {
        // ignore
      }

      // Move to Step 3
      setStep(3);
    } catch (err: any) {
      const msg = err.message || 'Verifikasi gagal';
      addLog(`❌ ERROR: ${msg}`, 'error');
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsVerifying(false);
    }
  };

  // Paste from clipboard helper
  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMagicLink(text.trim());
        addLog(`📋 Link ditempel dari clipboard (${text.slice(0, 30)}...)`, 'info');
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Tidak dapat mengakses clipboard browser. Silakan tempel secara manual.',
      });
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Hapus seluruh riwayat akun terverifikasi?')) {
      setHistory([]);
      localStorage.removeItem('am_verified_history');
      addLog('Riwayat verifikasi dibersihkan.', 'info');
    }
  };

  const handleSelectHistory = (rec: VerifiedRecord) => {
    setEmail(rec.email);
    setCookie(rec.cookie);
    setVerificationResult({
      userData: rec.userData,
      raw: rec.raw,
    });
    setStep(3);
    setStatusMessage({
      type: 'info',
      text: `Menampilkan akun tersimpan: ${rec.email}`,
    });
  };

  const resetFlow = () => {
    setStep(1);
    setMagicLink('');
    setVerificationResult(null);
    setStatusMessage({ type: null, text: '' });
    addLog('Formulir direset. Siap untuk proses baru.', 'cmd');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-black flex flex-col font-sans selection:bg-amber-300 selection:text-black">
      {/* Navigation & Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Brutalist Intro Hero Card */}
        <div className="bg-yellow-300 border-4 border-black shadow-[6px_6px_0px_0px_#000] p-4 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-black text-white px-2.5 py-1 font-mono font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>LAYANAN VERIFIKASI AKUN BERBASIS WEB</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight">
                AM PREM MAGIC LINK TOOL
              </h2>
              <p className="font-mono text-xs sm:text-sm font-semibold text-neutral-800">
                Otomasi perolehan session cookie, pengiriman magic link ke email, dan verifikasi akun Alight Motion secara cepat dan aman.
              </p>
            </div>

            {/* Brutalist Feature Badges */}
            <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
              <div className="px-3 py-1 bg-white border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Backend App Router</span>
              </div>
              <div className="px-3 py-1 bg-cyan-300 border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-black" />
                <span>Vercel Deploy Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Progress Navigation Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 font-mono text-xs font-black uppercase">
          <button
            onClick={() => setStep(1)}
            className={`p-2.5 sm:p-3 border-3 border-black text-center transition-all ${
              step === 1
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_#FFE600]'
                : 'bg-white hover:bg-neutral-100 shadow-[3px_3px_0px_0px_#000]'
            }`}
          >
            <span className="block text-[10px] text-neutral-400">LANGKAH 1</span>
            <span className="truncate block">Kirim Link</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`p-2.5 sm:p-3 border-3 border-black text-center transition-all ${
              step === 2
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_#FFE600]'
                : 'bg-white hover:bg-neutral-100 shadow-[3px_3px_0px_0px_#000]'
            }`}
          >
            <span className="block text-[10px] text-neutral-400">LANGKAH 2</span>
            <span className="truncate block">Verifikasi Link</span>
          </button>

          <button
            onClick={() => setStep(3)}
            disabled={!verificationResult}
            className={`p-2.5 sm:p-3 border-3 border-black text-center transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              step === 3
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_#FFE600]'
                : 'bg-white hover:bg-neutral-100 shadow-[3px_3px_0px_0px_#000]'
            }`}
          >
            <span className="block text-[10px] text-neutral-400">LANGKAH 3</span>
            <span className="truncate block">Hasil Akun</span>
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMessage.text && (
          <div
            className={`p-3.5 border-3 border-black shadow-[3px_3px_0px_0px_#000] font-mono text-xs font-bold flex items-start sm:items-center justify-between gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-300 text-black'
                : statusMessage.type === 'error'
                ? 'bg-rose-300 text-black'
                : 'bg-cyan-200 text-black'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
              {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 animate-spin" />}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage({ type: null, text: '' })}
              className="text-black underline text-[11px] shrink-0 hover:opacity-80"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Workflow Panels */}
        <div className="space-y-6">
          {/* STEP 1: SEND VERIFICATION LINK */}
          {step === 1 && (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-4 sm:p-6 space-y-5">
              <div className="flex items-start justify-between border-b-3 border-black pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-lime-400 border border-black px-2 py-0.5 inline-block">
                    STEP 01
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight mt-1">
                    Input Email & Kirim Magic Link
                  </h3>
                  <p className="font-mono text-xs text-neutral-600">
                    Sistem otomatis request session cookie dari API lalu memicu pengiriman magic link.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendLink} className="space-y-4 font-mono">
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">
                    Alamat Email Target <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 text-neutral-500" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh: user@gmail.com"
                      className="w-full pl-10 pr-3 py-3 bg-neutral-50 border-3 border-black font-bold text-sm focus:outline-none focus:bg-amber-50 focus:border-black shadow-[3px_3px_0px_0px_#000] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Pastikan email aktif dan dapat menerima email dari Alight Motion.
                  </p>
                </div>

                {/* Advanced Mode Toggle for Cookie */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-bold text-neutral-700 underline hover:text-black flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{showAdvanced ? 'Sembunyikan Opsi Cookie Manual' : 'Opsi Lanjutan: Cookie Manual'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="mt-2 p-3 bg-neutral-100 border-2 border-black space-y-2">
                      <label className="block text-[11px] font-bold uppercase">
                        Custom Session Cookie (Opsional)
                      </label>
                      <input
                        type="text"
                        value={cookie}
                        onChange={(e) => setCookie(e.target.value)}
                        placeholder="Biarkan kosong untuk otomatis fetch cookie baru..."
                        className="w-full px-3 py-2 bg-white border-2 border-black text-xs font-mono focus:outline-none focus:bg-amber-50"
                      />
                      <p className="text-[10px] text-neutral-500">
                        Secara default, sistem akan membuat session token unik secara otomatis untuk setiap proses verifikasi.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-lime-400 hover:bg-lime-300 text-black border-3 border-black font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>MEMPROSES PENGIRIMAN LINK...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>KIRIM MAGIC LINK KE EMAIL</span>
                      </>
                    )}
                  </button>

                  {cookie && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto py-3.5 px-4 bg-cyan-300 hover:bg-cyan-200 border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Lanjut ke Step 2</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFY MAGIC LINK */}
          {step === 2 && (
            <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] p-4 sm:p-6 space-y-5">
              <div className="flex items-start justify-between border-b-3 border-black pb-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider bg-cyan-300 border border-black px-2 py-0.5 inline-block">
                    STEP 02
                  </span>
                  <h3 className="text-xl font-black uppercase tracking-tight mt-1">
                    Buka Email & Tempel Magic Link
                  </h3>
                  <p className="font-mono text-xs text-neutral-600">
                    Cek kotak masuk email di <strong>{email || 'email Anda'}</strong>, lalu tempel tautan login di bawah.
                  </p>
                </div>
              </div>

              {/* Quick Helper Links */}
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Buka Gmail</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </a>

                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 border-2 border-black font-mono font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span>Tempel dari Clipboard</span>
                </button>
              </div>

              <form onSubmit={handleVerifyLink} className="space-y-4 font-mono">
                {/* Target Email display */}
                <div className="p-2.5 bg-neutral-100 border-2 border-black flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-500">Target Email: </span>
                    <strong className="text-black">{email || 'Belum diisi'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-blue-700 underline font-bold"
                  >
                    Ganti
                  </button>
                </div>

                {/* Magic Link Textarea / Input */}
                <div>
                  <label className="block text-xs font-black uppercase mb-1.5">
                    Tautan Magic Link <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      required
                      rows={3}
                      value={magicLink}
                      onChange={(e) => setMagicLink(e.target.value)}
                      placeholder="Contoh: https://alightcreative.com/am/login?token=... atau https://am.yappi.my.id/..."
                      className="w-full p-3 bg-neutral-50 border-3 border-black font-mono text-xs focus:outline-none focus:bg-amber-50 focus:border-black shadow-[3px_3px_0px_0px_#000] transition-all resize-none"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Salin seluruh tautan tombol &quot;Sign In / Verify&quot; yang ada di dalam pesan email Alight Motion.
                  </p>
                </div>

                {/* Cookie preview */}
                <div className="p-2.5 bg-neutral-50 border-2 border-black text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <KeyRound className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                    <span className="text-neutral-600 shrink-0">Session Cookie:</span>
                    <span className="text-black font-bold truncate">
                      {cookie ? `${cookie.slice(0, 20)}...` : 'Belum ada cookie (harus lewat Step 1)'}
                    </span>
                  </div>
                  {!cookie && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs bg-red-200 border border-black px-2 py-0.5 font-bold"
                    >
                      Ambil Cookie
                    </button>
                  )}
                </div>

                {/* Submit Action Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isVerifying || !cookie}
                    className="w-full sm:w-auto flex-1 py-3.5 px-6 bg-cyan-300 hover:bg-cyan-200 text-black border-3 border-black font-black uppercase text-sm tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>MEMVERIFIKASI MAGIC LINK...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>VERIFIKASI MAGIC LINK SEKARANG</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full sm:w-auto py-3.5 px-4 bg-white hover:bg-neutral-100 border-3 border-black font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                  >
                    Kembali ke Step 1
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: RESULT DISPLAY */}
          {step === 3 && verificationResult && (
            <div className="space-y-4">
              <VerificationCard
                email={email}
                userData={verificationResult.userData}
                raw={verificationResult.raw}
                cookie={cookie}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetFlow}
                  className="py-3 px-6 bg-amber-300 hover:bg-amber-200 border-3 border-black font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verifikasi Akun Lainnya</span>
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="py-3 px-4 bg-white hover:bg-neutral-100 border-3 border-black font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Ubah Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* History of Verified Accounts */}
        <HistorySection
          records={history}
          onClear={handleClearHistory}
          onSelect={handleSelectHistory}
        />

        {/* Live Terminal / Console Logger (Reflecting original CLI behavior) */}
        <LogTerminal logs={logs} onClear={clearLogs} />

        {/* Instructions & Help Card */}
        <div className="bg-white border-4 border-black shadow-[5px_5px_0px_0px_#000] p-4 sm:p-5 font-mono text-xs space-y-3">
          <div className="flex items-center gap-2 font-black uppercase text-sm border-b-2 border-black pb-2">
            <HelpCircle className="w-4 h-4 text-black" />
            <span>PANDUAN PENGGUNAAN</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-50 border-2 border-black">
              <div className="font-black text-black mb-1">1. MASUKKAN EMAIL</div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Tuliskan email Alight Motion Anda. Sistem akan meminta session cookie dan mengirimkan pesan verifikasi magic link ke inbox email Anda.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 border-2 border-black">
              <div className="font-black text-black mb-1">2. CEK INBOX EMAIL</div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Buka email masuk dari Alight Motion. Klik kanan atau tahan pada tombol &quot;Masuk / Verify&quot; lalu pilih &quot;Salin URL / Tautan&quot;.
              </p>
            </div>

            <div className="p-3 bg-neutral-50 border-2 border-black">
              <div className="font-black text-black mb-1">3. TEMPEL & VERIFIKASI</div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">
                Tempelkan tautan ke kolom Langkah 2 dan tekan tombol verifikasi. Informasi status akun akan langsung ditampilkan.
              </p>
            </div>
          </div>

          {/* Slogan & Note banner */}
          <div className="p-2.5 bg-black text-lime-400 font-bold text-center border-2 border-black flex items-center justify-center gap-2">
            <span>SISTEM VERIFIKASI AKUN ALIGHT MOTION - AMAN & OTOMATIS</span>
          </div>
        </div>
      </main>

      {/* Brutalist Footer */}
      <footer className="w-full border-t-4 border-black bg-white mt-8 py-5 font-mono text-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="space-y-1">
            <div>
              <span className="font-black uppercase">AM PREM VERIFIER</span> - SISTEM VERIFIKASI AKUN BERBASIS NEXT.JS APP ROUTER.
            </div>
            <div className="font-black uppercase tracking-wider text-black text-[11px] bg-amber-300 inline-block px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
              POWER BY SANN404 FORUM GROUP
            </div>
          </div>
          <div className="flex items-center gap-4 text-neutral-700 font-bold">
            <a
              href="https://whatsapp.com/channel/0029Vb6ukqnHQbS4mKP0j80L"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black underline uppercase"
            >
              SALURAN WHATSAPP RESMI
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
