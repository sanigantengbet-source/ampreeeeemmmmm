const BASE_URL = 'https://am.yappi.my.id';
const COOKIE_API = `${BASE_URL}/api/cookie`;
const SEND_API = `${BASE_URL}/api/send`;
const VERIFY_API = `${BASE_URL}/api/verify`;

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';

export interface CookieResponse {
  ok: boolean;
  cookie?: string;
  error?: string;
}

export interface SendLinkResponse {
  ok: boolean;
  message?: string;
  cookie?: string;
  error?: string;
}

export interface VerifyLinkResponse {
  ok: boolean;
  data?: {
    user?: any;
    [key: string]: any;
  };
  userData?: any;
  error?: string;
}

export async function fetchSessionCookie(): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(COOKIE_API, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'application/json',
      },
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to fetch cookie: HTTP ${res.status}`);
    }

    const data: CookieResponse = await res.json();
    if (data?.ok && data?.cookie) {
      return data.cookie;
    }

    throw new Error(data?.error || 'Gagal mendapatkan session cookie dari server AM');
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Timeout: Gagal terhubung ke API Cookie (12 detik)');
    }
    throw new Error(err.message || 'Error saat inisialisasi session cookie');
  }
}

export async function sendVerificationLink(
  email: string,
  providedCookie?: string
): Promise<{ ok: boolean; cookie: string; message: string }> {
  const cookie = providedCookie || (await fetchSessionCookie());

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(SEND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
        Referer: `${BASE_URL}/`,
        'User-Agent': DEFAULT_USER_AGENT,
      },
      body: JSON.stringify({
        email: email.trim(),
        cookie: cookie,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    const data: SendLinkResponse = await res.json().catch(() => ({
      ok: false,
      error: `Server responded with status ${res.status}`,
    }));

    if (res.ok && data?.ok) {
      return {
        ok: true,
        cookie,
        message: 'Link verifikasi berhasil dikirim ke email!',
      };
    }

    throw new Error(data?.error || `Gagal mengirim link verifikasi (${res.status})`);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Timeout saat mengirim link verifikasi (30 detik)');
    }
    throw new Error(err.message || 'Terjadi kesalahan saat mengirim link verifikasi');
  }
}

export async function verifyMagicLink(
  email: string,
  magicLink: string,
  cookie: string
): Promise<{ ok: boolean; userData: any; raw: any }> {
  if (!email || !magicLink || !cookie) {
    throw new Error('Email, Magic Link, dan Session Cookie wajib diisi');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(VERIFY_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE_URL,
        Referer: `${BASE_URL}/`,
        'User-Agent': DEFAULT_USER_AGENT,
      },
      body: JSON.stringify({
        email: email.trim(),
        link: magicLink.trim(),
        cookie: cookie.trim(),
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    const data: VerifyLinkResponse = await res.json().catch(() => ({
      ok: false,
      error: `Server responded with status ${res.status}`,
    }));

    if (res.ok && data?.ok) {
      return {
        ok: true,
        userData: data.data?.user || data.userData || data.data || null,
        raw: data,
      };
    }

    throw new Error(data?.error || `Verifikasi gagal (${res.status})`);
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Timeout saat verifikasi magic link (35 detik)');
    }
    throw new Error(err.message || 'Terjadi kesalahan saat verifikasi magic link');
  }
}
